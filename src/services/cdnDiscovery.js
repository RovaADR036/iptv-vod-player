import { CDN_DISCOVERY_MAX_DEPTH } from "../config/defaults.js";
import { isLineIptvOrigin } from "../utils/iptvHost.js";
import { parsePlaylistForCdn } from "../utils/playlistCdn.js";
import { normalizeProxyBase } from "../utils/proxyUrl.js";

export async function checkProxyHealth(proxyBase) {
  const base = normalizeProxyBase(proxyBase);
  if (!base) return { ok: false, reason: "no-base" };
  try {
    const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false, reason: `health-${res.status}` };
    const body = await res.json();
    if (body.genericProxy === false) {
      return { ok: false, reason: "generic-disabled" };
    }
    return { ok: true, body };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

export async function discoverCdnOrigin(playUrl, proxyBase, depth = 0) {
  if (depth > CDN_DISCOVERY_MAX_DEPTH) return null;

  try {
    const res = await fetch(playUrl);
    if (!res.ok) return null;

    const headerCdn = res.headers.get("x-session-cdn-origin");
    if (headerCdn) return headerCdn;

    const text = await res.text();
    const base = normalizeProxyBase(proxyBase);
    const { cdnOrigin, childM3u8 } = parsePlaylistForCdn(text, base);

    if (cdnOrigin && !isLineIptvOrigin(cdnOrigin)) return cdnOrigin;

    if (childM3u8) {
      const fromChild = await discoverCdnOrigin(childM3u8, proxyBase, depth + 1);
      if (fromChild) return fromChild;
    }

    return cdnOrigin;
  } catch {
    return null;
  }
}
