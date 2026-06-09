const LOCAL_PROXY_PATTERN = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i;

export function isLocalProxyUrl(url) {
  return LOCAL_PROXY_PATTERN.test(url);
}

export function isPassthroughHlsUrl(url) {
  try {
    const u = new URL(url);
    return isLocalProxyUrl(url) && u.pathname.startsWith("/passthrough/hls/");
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
