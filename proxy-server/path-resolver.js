import { HLS_PREFIX } from "./constants.js";
import { isLineIptvHost } from "./hosts.js";

export function remapSegmentTarget(targetUrl, session) {
  try {
    const u = new URL(targetUrl);
    if (!session.sessionCdnOrigin) return targetUrl;
    if (!u.pathname.startsWith(HLS_PREFIX + "/")) return targetUrl;
    if (isLineIptvHost(u.hostname)) {
      return new URL(u.pathname + u.search, session.sessionCdnOrigin).href;
    }
  } catch {
    /* ignore */
  }
  return targetUrl;
}

export function upstreamFromReferer(referer, pathname, search, session) {
  if (!referer) return null;
  try {
    const ref = new URL(referer);
    const inner = ref.searchParams.get("url");
    if (!inner) return null;

    const innerUrl = new URL(inner);
    const origin =
      pathname.startsWith(HLS_PREFIX + "/") &&
      session.sessionCdnOrigin &&
      isLineIptvHost(innerUrl.hostname)
        ? session.sessionCdnOrigin
        : innerUrl.origin;

    return new URL(pathname + search, origin).href;
  } catch {
    return null;
  }
}

export function upstreamFromPath(pathname, search, session) {
  const origin = session.sessionCdnOrigin || session.lastUpstreamOrigin;
  if (!origin) return null;
  return new URL(pathname + search, origin).href;
}
