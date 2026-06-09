import { CDN_DISCOVERY_MAX_DEPTH } from "../../config/defaults.js";
import { parsePlaylistForCdn } from "./playlistParser.js";
import { isLineIptvOrigin } from "../hosts/lineIptv.js";
import { normalizeProxyBase } from "../../utils/proxyUrl.js";

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
