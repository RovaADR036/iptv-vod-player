import { HLS_PREFIX } from "./constants.js";
import { isLineIptvHost, isLocalProxyHost } from "./hosts.js";

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

function resolveMediaRef(ref, playlistUrl, session) {
  const trimmed = ref.trim();
  if (!trimmed) return trimmed;

  const playlistOrigin = new URL(playlistUrl).origin;
  const baseForPaths =
    session.sessionCdnOrigin &&
    (trimmed.startsWith("/") || isLineIptvHost(new URL(playlistUrl).hostname))
      ? session.sessionCdnOrigin
      : playlistUrl;

  if (/^https?:\/\//i.test(trimmed)) {
    if (isLocalProxyHost(trimmed) && !alreadyProxied(trimmed)) {
      const path = new URL(trimmed).pathname + new URL(trimmed).search;
      const origin =
        session.sessionCdnOrigin || session.lastUpstreamOrigin || playlistOrigin;
      return new URL(path, origin).href;
    }
    if (isLineIptvHost(new URL(trimmed).hostname) && session.sessionCdnOrigin) {
      const u = new URL(trimmed);
      if (u.pathname.startsWith(HLS_PREFIX + "/")) {
        return new URL(u.pathname + u.search, session.sessionCdnOrigin).href;
      }
    }
    return trimmed;
  }

  return new URL(trimmed, baseForPaths).href;
}

export function rewritePlaylist(text, playlistUrl, proxyOrigin, session) {
  session.lastUpstreamOrigin =
    session.sessionCdnOrigin || new URL(playlistUrl).origin;

  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (trimmed.startsWith("#")) {
        return trimmed.replace(/URI="([^"]+)"/gi, (_, uri) => {
          const abs = resolveMediaRef(uri, playlistUrl, session);
          return `URI="${proxyWrap(abs, proxyOrigin)}"`;
        });
      }

      const abs = resolveMediaRef(trimmed, playlistUrl, session);
      return proxyWrap(abs, proxyOrigin);
    })
    .join("\n");
}
