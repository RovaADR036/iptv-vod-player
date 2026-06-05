import { isLocalProxyUrl, remapLineSegmentUrl } from "../utils/iptvHost.js";
import { normalizeProxyBase } from "../utils/proxyUrl.js";

export function createHlsUrlResolver({ getProxySettings, getCdnOrigin }) {
  function fixHlsRequestUrl(url) {
    const { useProxy, proxyBase } = getProxySettings();
    if (!useProxy) return url;

    const base = normalizeProxyBase(proxyBase);
    if (!base) return url;

    const cdnOrigin = getCdnOrigin();

    if (url.includes("/proxy?url=")) {
      try {
        const inner = decodeURIComponent(new URL(url).searchParams.get("url"));
        const fixed = remapLineSegmentUrl(inner, cdnOrigin);
        if (fixed !== inner) {
          return `${base}/proxy?url=${encodeURIComponent(fixed)}`;
        }
      } catch {
        /* ignore */
      }
      return url;
    }

    if (isLocalProxyUrl(url)) {
      const u = new URL(url);
      if (!cdnOrigin) return url;
      const upstream = new URL(u.pathname + u.search, cdnOrigin).href;
      return `${base}/proxy?url=${encodeURIComponent(upstream)}`;
    }

    if (/^https?:\/\//i.test(url)) {
      return `${base}/proxy?url=${encodeURIComponent(
        remapLineSegmentUrl(url, cdnOrigin)
      )}`;
    }

    return url;
  }

  return { fixHlsRequestUrl };
}
