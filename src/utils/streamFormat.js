export function isHlsUrl(url) {
  try {
    return /\.m3u8?$/i.test(new URL(url).pathname);
  } catch {
    return /\.m3u8/i.test(url);
  }
}
