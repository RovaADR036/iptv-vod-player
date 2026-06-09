import { isLineIptvOrigin } from "../hosts/lineIptv.js";

const PROXY_URL_PATTERN = /\/proxy\?url=([^&\s"'#]+)/gi;
const REDIRECT_URL_PATTERN = /\/redirect\?url=([^&\s"'#]+)/gi;

function decodeEmbeddedUrl(match) {
  try {
    return new URL(decodeURIComponent(match)).origin;
  } catch {
    return null;
  }
}

export function collectOriginsFromPlaylistText(text) {
  const origins = [];
  for (const m of text.matchAll(PROXY_URL_PATTERN)) {
    const origin = decodeEmbeddedUrl(m[1]);
    if (origin) origins.push(origin);
  }
  for (const m of text.matchAll(REDIRECT_URL_PATTERN)) {
    const origin = decodeEmbeddedUrl(m[1]);
    if (origin) origins.push(origin);
  }
  return origins;
}

export function pickBestCdnOrigin(origins) {
  const unique = [...new Set(origins.filter(Boolean))];
  const nonLine = unique.filter((o) => !isLineIptvOrigin(o));
  const httpsNonLine = nonLine.filter((o) => o.startsWith("https://"));
  if (httpsNonLine.length) return httpsNonLine[0];
  const httpNonLine = nonLine.filter((o) => o.startsWith("http://"));
  if (httpNonLine.length) return httpNonLine[0];
  if (nonLine.length) return nonLine[0];
  return unique[0] || null;
}

export function parsePlaylistForCdn(text, proxyBase) {
  let childM3u8 = null;
  const origins = collectOriginsFromPlaylistText(text);
  const base = proxyBase.replace(/\/$/, "");

  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    const embedded =
      t.match(/\/proxy\?url=([^&\s"'#]+)/i) ||
      t.match(/\/redirect\?url=([^&\s"'#]+)/i);
    if (!embedded) continue;

    try {
      const target = decodeURIComponent(embedded[1]);
      if (/\.(ts|m4s|mp4|aac)(\?|$)/i.test(target)) {
        origins.push(new URL(target).origin);
      }
      if (/\.m3u8?(\?|$)/i.test(target) && !childM3u8) {
        childM3u8 = `${base}/proxy?url=${encodeURIComponent(target)}`;
      }
    } catch {
      /* ignore */
    }
  }

  return { cdnOrigin: pickBestCdnOrigin(origins), childM3u8 };
}
