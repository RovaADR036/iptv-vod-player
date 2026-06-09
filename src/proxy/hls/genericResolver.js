import {
  isLocalProxyUrl,
  isPassthroughHlsUrl,
  localProxyPathToUpstream,
  remapLineSegmentUrl,
} from "../hosts/index.js";
import { buildProxiedUrl, normalizeProxyBase } from "../../utils/proxyUrl.js";

export function resolveGenericHlsUrl(url, { proxyBase, cdnOrigin }) {
  const base = normalizeProxyBase(proxyBase);
  if (!base) return url;

  if (url.includes("/proxy?url=")) {
    try {
      const inner = decodeURIComponent(new URL(url).searchParams.get("url"));
      const fixed = remapLineSegmentUrl(inner, cdnOrigin);
      if (fixed !== inner) {
        return buildProxiedUrl(fixed, base);
      }
    } catch {
      /* ignore */
    }
    return url;
  }

  if (isLocalProxyUrl(url) || isPassthroughHlsUrl(url)) {
    const passthroughUpstream = localProxyPathToUpstream(url, cdnOrigin);
    if (passthroughUpstream) {
      return buildProxiedUrl(passthroughUpstream, base);
    }

    try {
      const u = new URL(url);
      if (!cdnOrigin) return url;
      const upstream = new URL(u.pathname + u.search, cdnOrigin).href;
      return buildProxiedUrl(upstream, base);
    } catch {
      return url;
    }
  }

  if (/^https?:\/\//i.test(url)) {
    return buildProxiedUrl(remapLineSegmentUrl(url, cdnOrigin), base);
  }

  return url;
}
