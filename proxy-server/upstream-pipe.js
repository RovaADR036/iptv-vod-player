import http from "node:http";
import https from "node:https";
import { UPSTREAM_HEADERS } from "./constants.js";
import { isStreamEdgeHost } from "./hosts.js";
import { buildCorsHeaders, decompressBody } from "./http-utils.js";
import {
  isM3u8Path,
  isM3u8ContentType,
  isPlaylistBody,
} from "./playlist-detect.js";
import { rewritePlaylist } from "./playlist-rewriter.js";
import { remapSegmentTarget } from "./path-resolver.js";
import { getInsecureAgent } from "./ssl-agent.js";

export function pipeUpstream(
  targetUrl,
  clientReq,
  clientRes,
  proxyOrigin,
  session,
  forcePlaylist
) {
  targetUrl = remapSegmentTarget(targetUrl, session);

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

  session.recordUpstreamOrigin(parsed.origin);
  if (!isStreamEdgeHost(parsed.hostname)) {
    session.adoptCdnOrigin(parsed.origin);
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
  if (clientReq.headers["if-range"]) {
    reqHeaders["If-Range"] = clientReq.headers["if-range"];
  }

  const opts = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: clientReq.method === "HEAD" ? "HEAD" : "GET",
    headers: reqHeaders,
    agent: parsed.protocol === "https:" ? getInsecureAgent() : undefined,
  };

  const mayBePlaylist = clientReq.method !== "HEAD" && trackPlaylist;

  const upstream = lib.request(opts, (upstreamRes) => {
    const status = upstreamRes.statusCode || 502;
    const location = upstreamRes.headers.location;

    if ([301, 302, 303, 307, 308].includes(status) && location) {
      const nextUrl = new URL(location, targetUrl).href;
      session.noteCdnRedirect(targetUrl, nextUrl);
      upstreamRes.resume();
      pipeUpstream(nextUrl, clientReq, clientRes, proxyOrigin, session, trackPlaylist);
      return;
    }

    const outHeaders = buildCorsHeaders(upstreamRes.headers);

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

      const body = rewritePlaylist(
        raw.toString("utf8"),
        targetUrl,
        proxyOrigin,
        session
      );
      const buf = Buffer.from(body, "utf8");
      outHeaders["content-type"] = "application/vnd.apple.mpegurl; charset=utf-8";
      outHeaders["content-length"] = String(buf.length);
      if (session.sessionCdnOrigin) {
        outHeaders["x-session-cdn-origin"] = session.sessionCdnOrigin;
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
