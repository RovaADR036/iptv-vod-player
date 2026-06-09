import { HLS_PREFIX } from "./constants.js";
import { discoverCdnFromRedirects } from "./cdn-discovery.js";
import { isLineIptvHost } from "./hosts.js";
import { getProxyOrigin, handlePreflight } from "./http-utils.js";
import { isM3u8Path } from "./playlist-detect.js";
import { upstreamFromReferer, upstreamFromPath } from "./path-resolver.js";
import { pipeUpstream } from "./upstream-pipe.js";

export function routeRequest(req, res, session, port) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (handlePreflight(req, res)) return;

  const localUrl = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  const proxyOrigin = getProxyOrigin(req, port);

  if (localUrl.pathname === "/proxy") {
    handleProxyRoute(req, res, session, proxyOrigin, localUrl);
    return;
  }

  const pathAndQuery = localUrl.pathname + localUrl.search;
  relayHlsPath(req, res, session, proxyOrigin, pathAndQuery);
}

function handleProxyRoute(req, res, session, proxyOrigin, localUrl) {
  const target = localUrl.searchParams.get("url");
  if (!target) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Paramètre url manquant");
    return;
  }

  if (isM3u8Path(target)) {
    session.setEntryM3u8(target);
  }

  const startPipe = () =>
    pipeUpstream(target, req, res, proxyOrigin, session, isM3u8Path(target));

  try {
    const host = new URL(target).hostname;
    if (isM3u8Path(target) && isLineIptvHost(host) && !session.sessionCdnOrigin) {
      discoverCdnFromRedirects(target, session, startPipe);
      return;
    }
  } catch {
    /* ignore */
  }

  startPipe();
}

function relayHlsPath(req, res, session, proxyOrigin, pathAndQuery) {
  const relay = () => {
    const upstream =
      upstreamFromReferer(
        req.headers.referer,
        localPathname(pathAndQuery),
        localSearch(pathAndQuery),
        session
      ) ||
      upstreamFromPath(
        localPathname(pathAndQuery),
        localSearch(pathAndQuery),
        session
      );

    if (upstream) {
      pipeUpstream(upstream, req, res, proxyOrigin, session, false);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(
      `Chemin non géré : ${pathAndQuery}\nChargez d'abord une playlist m3u8 via /proxy?url=...\n`
    );
  };

  if (pathAndQuery.startsWith(HLS_PREFIX + "/")) {
    if (!session.sessionCdnOrigin && session.sessionEntryM3u8) {
      discoverCdnFromRedirects(session.sessionEntryM3u8, session, relay);
      return;
    }
    relay();
    return;
  }

  relay();
}

function localPathname(pathAndQuery) {
  const idx = pathAndQuery.indexOf("?");
  return idx >= 0 ? pathAndQuery.slice(0, idx) : pathAndQuery;
}

function localSearch(pathAndQuery) {
  const idx = pathAndQuery.indexOf("?");
  return idx >= 0 ? pathAndQuery.slice(idx) : "";
}
