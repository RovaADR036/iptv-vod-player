/**
 * Proxy local pour tester les flux IPTV (mp4, m3u8/HLS) dans le navigateur.
 * Réécrit les playlists m3u8 pour que les segments passent aussi par le proxy.
 */
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import zlib from "node:zlib";

const PORT = Number(process.env.STREAM_PROXY_PORT) || 3080;
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

/** Dernier serveur IPTV vu (secours si Referer absent sur /hls/...) */
let lastUpstreamOrigin = null;
/** CDN HTTPS découvert après redirection (ex. https://….dvodcdn.xyz) */
let sessionCdnOrigin = null;
/** Première URL m3u8 demandée dans cette session proxy */
let sessionEntryM3u8 = null;

function isLineIptvHost(hostname) {
  return /dndnscloud|xtream|line\./i.test(hostname);
}

function isStreamEdgeHost(hostname) {
  return isLineIptvHost(hostname);
}

function adoptCdnOrigin(origin) {
  if (!origin || isStreamEdgeHost(new URL(origin).hostname)) return;
  sessionCdnOrigin = origin;
  lastUpstreamOrigin = origin;
}

function noteCdnRedirect(fromUrl, toUrl) {
  try {
    const from = new URL(fromUrl);
    const to = new URL(toUrl);
    if (from.origin === to.origin) return;
    if (!isStreamEdgeHost(to.hostname)) {
      adoptCdnOrigin(to.origin);
    }
  } catch {
    /* ignore */
  }
}

function remapSegmentTarget(targetUrl) {
  try {
    const u = new URL(targetUrl);
    if (!sessionCdnOrigin) return targetUrl;
    if (!u.pathname.startsWith("/hls/")) return targetUrl;
    if (isLineIptvHost(u.hostname)) {
      return new URL(u.pathname + u.search, sessionCdnOrigin).href;
    }
  } catch {
    /* ignore */
  }
  return targetUrl;
}

const UPSTREAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Connection: "keep-alive",
};

function isM3u8Path(urlString) {
  try {
    return /\.m3u8?$/i.test(new URL(urlString).pathname);
  } catch {
    return /\.m3u8/i.test(urlString);
  }
}

function isM3u8ContentType(contentType) {
  return contentType && /mpegurl|m3u8/i.test(contentType);
}

function isPlaylistBody(buf) {
  const head = buf.slice(0, 32).toString("utf8").trimStart();
  return head.startsWith("#EXTM3U") || head.startsWith("#EXT-X-");
}

function isLocalProxyHost(href) {
  try {
    const h = new URL(href).hostname;
    return h === "127.0.0.1" || h === "localhost";
  } catch {
    return false;
  }
}

function alreadyProxied(absUrl) {
  try {
    const u = new URL(absUrl);
    return u.pathname === "/proxy" && u.searchParams.has("url");
  } catch {
    return false;
  }
}

function proxyWrap(absUrl, proxyOrigin) {
  if (alreadyProxied(absUrl)) return absUrl;
  if (isLocalProxyHost(absUrl)) return absUrl;
  return `${proxyOrigin}/proxy?url=${encodeURIComponent(absUrl)}`;
}

function resolveMediaRef(ref, playlistUrl) {
  const trimmed = ref.trim();
  if (!trimmed) return trimmed;
  const playlistOrigin = new URL(playlistUrl).origin;
  const baseForPaths =
    sessionCdnOrigin &&
    (trimmed.startsWith("/") || isLineIptvHost(new URL(playlistUrl).hostname))
      ? sessionCdnOrigin
      : playlistUrl;

  if (/^https?:\/\//i.test(trimmed)) {
    if (isLocalProxyHost(trimmed) && !alreadyProxied(trimmed)) {
      const path = new URL(trimmed).pathname + new URL(trimmed).search;
      const origin = sessionCdnOrigin || lastUpstreamOrigin || playlistOrigin;
      return new URL(path, origin).href;
    }
    if (isLineIptvHost(new URL(trimmed).hostname) && sessionCdnOrigin) {
      const u = new URL(trimmed);
      if (u.pathname.startsWith("/hls/")) {
        return new URL(u.pathname + u.search, sessionCdnOrigin).href;
      }
    }
    return trimmed;
  }
  return new URL(trimmed, baseForPaths).href;
}

function rewritePlaylist(text, playlistUrl, proxyOrigin) {
  lastUpstreamOrigin = sessionCdnOrigin || new URL(playlistUrl).origin;

  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (trimmed.startsWith("#")) {
        return trimmed.replace(/URI="([^"]+)"/gi, (_, uri) => {
          const abs = resolveMediaRef(uri, playlistUrl);
          return `URI="${proxyWrap(abs, proxyOrigin)}"`;
        });
      }

      const abs = resolveMediaRef(trimmed, playlistUrl);
      return proxyWrap(abs, proxyOrigin);
    })
    .join("\n");
}

function upstreamFromReferer(referer, pathname, search = "") {
  if (!referer) return null;
  try {
    const ref = new URL(referer);
    const inner = ref.searchParams.get("url");
    if (inner) {
      const innerUrl = new URL(inner);
      const origin =
        pathname.startsWith("/hls/") &&
        sessionCdnOrigin &&
        isLineIptvHost(innerUrl.hostname)
          ? sessionCdnOrigin
          : innerUrl.origin;
      return new URL(pathname + search, origin).href;
    }
  } catch {
    return null;
  }
  return null;
}

function upstreamFromPath(pathname, search = "") {
  const origin = sessionCdnOrigin || lastUpstreamOrigin;
  if (origin) {
    return new URL(pathname + search, origin).href;
  }
  return null;
}

function discoverCdnFromRedirects(startUrl, done) {
  if (sessionCdnOrigin) {
    done();
    return;
  }

  const visit = (url, depth) => {
    if (depth > 15) {
      done();
      return;
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      done();
      return;
    }

    const lib = parsed.protocol === "https:" ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: UPSTREAM_HEADERS,
      agent: parsed.protocol === "https:" ? insecureAgent : undefined,
    };

    const req = lib.request(opts, (res) => {
      const status = res.statusCode || 0;
      const location = res.headers.location;

      if ([301, 302, 303, 307, 308].includes(status) && location) {
        const next = new URL(location, url).href;
        noteCdnRedirect(url, next);
        res.resume();
        visit(next, depth + 1);
        return;
      }

      res.resume();
      adoptCdnOrigin(parsed.origin);
      done();
    });

    req.on("error", () => done());
    req.end();
  };

  visit(startUrl, 0);
}

function decompressBody(buf, encoding) {
  if (encoding === "gzip") return zlib.gunzipSync(buf);
  if (encoding === "deflate") return zlib.inflateSync(buf);
  if (encoding === "br") return zlib.brotliDecompressSync(buf);
  return buf;
}

function pipeUpstream(targetUrl, clientReq, clientRes, proxyOrigin, forcePlaylist) {
  targetUrl = remapSegmentTarget(targetUrl);

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    clientRes.writeHead(400, { "Content-Type": "text/plain" });
    clientRes.end("URL invalide");
    return;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    clientRes.writeHead(400, { "Content-Type": "text/plain" });
    clientRes.end("Seuls http et https sont autorisés");
    return;
  }

  lastUpstreamOrigin = parsed.origin;
  if (!isStreamEdgeHost(parsed.hostname)) {
    adoptCdnOrigin(parsed.origin);
  }

  const trackPlaylist =
    forcePlaylist === true ||
    (forcePlaylist !== false && isM3u8Path(targetUrl));

  const lib = parsed.protocol === "https:" ? https : http;
  const reqHeaders = {
    ...UPSTREAM_HEADERS,
    Referer: `${parsed.origin}/`,
  };
  if (clientReq.headers.range) reqHeaders.Range = clientReq.headers.range;
  if (clientReq.headers["if-range"]) reqHeaders["If-Range"] = clientReq.headers["if-range"];

  const opts = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: clientReq.method === "HEAD" ? "HEAD" : "GET",
    headers: reqHeaders,
    agent: parsed.protocol === "https:" ? insecureAgent : undefined,
  };

  const mayBePlaylist = clientReq.method !== "HEAD" && trackPlaylist;

  const upstream = lib.request(opts, (upstreamRes) => {
    const status = upstreamRes.statusCode || 502;
    const location = upstreamRes.headers.location;

    if ([301, 302, 303, 307, 308].includes(status) && location) {
      const nextUrl = new URL(location, targetUrl).href;
      noteCdnRedirect(targetUrl, nextUrl);
      upstreamRes.resume();
      pipeUpstream(nextUrl, clientReq, clientRes, proxyOrigin, trackPlaylist);
      return;
    }

    const outHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers":
        "Content-Length, Content-Range, Accept-Ranges, Content-Type, X-Session-Cdn-Origin",
    };
    for (const key of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
    ]) {
      if (upstreamRes.headers[key]) outHeaders[key] = upstreamRes.headers[key];
    }

    if (clientReq.method === "HEAD") {
      clientRes.writeHead(status, outHeaders);
      clientRes.end();
      upstreamRes.resume();
      return;
    }

    if (status >= 400) {
      const chunks = [];
      upstreamRes.on("data", (c) => chunks.push(c));
      upstreamRes.on("end", () => {
        const errBody = Buffer.concat(chunks).toString("utf8").slice(0, 200);
        clientRes.writeHead(502, { "Content-Type": "text/plain" });
        clientRes.end(`Upstream HTTP ${status}${errBody ? `: ${errBody}` : ""}`);
      });
      return;
    }

    const sniffPlaylist =
      mayBePlaylist || isM3u8ContentType(upstreamRes.headers["content-type"]);

    if (!sniffPlaylist) {
      clientRes.writeHead(status, outHeaders);
      upstreamRes.pipe(clientRes);
      return;
    }

    const chunks = [];
    upstreamRes.on("data", (chunk) => chunks.push(chunk));
    upstreamRes.on("end", () => {
      let raw = Buffer.concat(chunks);
      const encoding = upstreamRes.headers["content-encoding"];
      try {
        raw = decompressBody(raw, encoding);
      } catch {
        /* corps brut */
      }

      if (!isPlaylistBody(raw)) {
        clientRes.writeHead(status, outHeaders);
        clientRes.end(raw);
        return;
      }

      const body = rewritePlaylist(raw.toString("utf8"), targetUrl, proxyOrigin);
      const buf = Buffer.from(body, "utf8");
      outHeaders["content-type"] = "application/vnd.apple.mpegurl; charset=utf-8";
      outHeaders["content-length"] = String(buf.length);
      if (sessionCdnOrigin) {
        outHeaders["x-session-cdn-origin"] = sessionCdnOrigin;
      }
      delete outHeaders["content-range"];
      delete outHeaders["content-encoding"];
      clientRes.writeHead(status, outHeaders);
      clientRes.end(buf);
    });
  });

  upstream.on("error", (err) => {
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { "Content-Type": "text/plain" });
      clientRes.end(`Proxy: ${err.message}`);
    } else {
      clientRes.end();
    }
  });

  upstream.end();
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range");
    res.writeHead(204);
    res.end();
    return;
  }

  const localUrl = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const proxyOrigin = `http://${req.headers.host || `127.0.0.1:${PORT}`}`;

  if (localUrl.pathname === "/proxy") {
    const target = localUrl.searchParams.get("url");
    if (!target) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Paramètre url manquant");
      return;
    }

    if (isM3u8Path(target)) {
      sessionEntryM3u8 = target;
    }

    const startPipe = () =>
      pipeUpstream(target, req, res, proxyOrigin, isM3u8Path(target));

    try {
      const host = new URL(target).hostname;
      if (isM3u8Path(target) && isLineIptvHost(host) && !sessionCdnOrigin) {
        discoverCdnFromRedirects(target, startPipe);
        return;
      }
    } catch {
      /* ignore */
    }

    startPipe();
    return;
  }

  const pathAndQuery = localUrl.pathname + localUrl.search;

  const relayPath = () => {
    const upstream =
      upstreamFromReferer(req.headers.referer, pathAndQuery) ||
      upstreamFromPath(pathAndQuery);

    if (upstream) {
      pipeUpstream(upstream, req, res, proxyOrigin, false);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      `Chemin non géré : ${pathAndQuery}\nChargez d'abord une playlist m3u8 via /proxy?url=...\n`
    );
  };

  if (pathAndQuery.startsWith("/hls/")) {
    if (!sessionCdnOrigin && sessionEntryM3u8) {
      discoverCdnFromRedirects(sessionEntryM3u8, relayPath);
      return;
    }
    relayPath();
    return;
  }

  relayPath();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Proxy flux (mp4 + m3u8): http://127.0.0.1:${PORT}/proxy?url=...`);
  console.log(`Segments relatifs (/hls/...) relayés via Referer ou dernier CDN connu.`);
});
