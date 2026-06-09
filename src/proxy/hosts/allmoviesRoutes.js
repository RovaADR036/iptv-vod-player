import { isLocalProxyUrl } from "./localProxy.js";

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
