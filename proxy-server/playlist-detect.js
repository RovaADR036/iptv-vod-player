export function isM3u8Path(urlString) {
  try {
    return /\.m3u8?$/i.test(new URL(urlString).pathname);
  } catch {
    return /\.m3u8/i.test(urlString);
  }
}

export function isM3u8ContentType(contentType) {
  return contentType && /mpegurl|m3u8/i.test(contentType);
}

export function isPlaylistBody(buf) {
  const head = buf.slice(0, 32).toString("utf8").trimStart();
  return head.startsWith("#EXTM3U") || head.startsWith("#EXT-X-");
}
