export function isLineIptvOrigin(origin) {
  try {
    const h = new URL(origin).hostname.toLowerCase();
    return h === "line.dndnscloud.ru" || /^line\./i.test(h);
  } catch {
    return false;
  }
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
