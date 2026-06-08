export function isLocalProxyUrl(url) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(url);
}

export function isPassthroughHlsUrl(url) {
  try {
    const u = new URL(url);
    return isLocalProxyUrl(url) && u.pathname.startsWith("/passthrough/hls/");
  } catch {
    return false;
  }
}

export function isAllmoviesProviderSegmentUrl(url) {
  try {
    const u = new URL(url);
    if (!isLocalProxyUrl(url)) return false;
    return /^\/hls\/[^/]+\/[^/]+\//.test(u.pathname);
  } catch {
    return false;
  }
}

export function isAllmoviesProviderRedirectUrl(url) {
  return /\/proxy\/[^/]+\/redirect\?url=/i.test(url);
}

export function isLineIptvOrigin(origin) {
  try {
    const h = new URL(origin).hostname.toLowerCase();
    return h === "line.dndnscloud.ru" || /^line\./i.test(h);
  } catch {
    return false;
  }
}

export function localProxyPathToUpstream(url, cdnOrigin) {
  if (!cdnOrigin) return null;
  try {
    const u = new URL(url);
    let path = u.pathname;
    if (path.startsWith("/passthrough/hls/")) {
      path = "/hls/" + path.slice("/passthrough/hls/".length);
    }
    if (path.startsWith("/hls/")) {
      return new URL(path + u.search, cdnOrigin).href;
    }
  } catch {
    /* URL invalide */
  }
  return null;
}

export function remapLineSegmentUrl(absUrl, cdnOrigin) {
  if (!cdnOrigin) return absUrl;
  try {
    const u = new URL(absUrl);
    if (u.pathname.startsWith("/hls/") && isLineIptvOrigin(u.origin)) {
      return new URL(u.pathname + u.search, cdnOrigin).href;
    }
  } catch {
    /* URL invalide */
  }
  return absUrl;
}
