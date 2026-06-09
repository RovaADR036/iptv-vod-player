import {
  isAllmoviesProviderRedirectUrl,
  isAllmoviesProviderSegmentUrl,
  isLocalProxyUrl,
} from "../hosts/index.js";
import { normalizeProxyBase } from "../../utils/proxyUrl.js";

export function resolveProviderHlsUrl(url, { proxyBase }) {
  if (
    isAllmoviesProviderSegmentUrl(url) ||
    isAllmoviesProviderRedirectUrl(url)
  ) {
    return url;
  }

  const base = normalizeProxyBase(proxyBase);
  if (!base) return url;

  try {
    const u = new URL(url, base + "/");
    if (
      isLocalProxyUrl(u.href) &&
      (u.pathname.startsWith("/hls/") || u.pathname.includes("/redirect"))
    ) {
      return u.href;
    }
  } catch {
    /* ignore */
  }

  return url;
}
