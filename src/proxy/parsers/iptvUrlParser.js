import { PROVIDERS } from "../../config/providers.js";
import { normalizeProxyBase } from "../../utils/proxyUrl.js";

const STREAM_PREFIXES = ["live", "movie", "series", "vod"];

function findProviderForHost(hostname, providers = PROVIDERS) {
  const host = hostname.toLowerCase();
  return (
    providers.find((p) =>
      p.upstreamHosts.some(
        (h) => host === h.toLowerCase() || host.endsWith(`.${h.toLowerCase()}`)
      )
    ) ?? null
  );
}

export function parseIptvProviderUrl(rawUrl, options = {}) {
  const { slug: forcedSlug, providers = PROVIDERS } = options;

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const streamIdx = segments.findIndex((s) =>
    STREAM_PREFIXES.includes(s.toLowerCase())
  );
  if (streamIdx < 0) return null;

  const streamType = segments[streamIdx].toLowerCase();
  const relativePath = segments.slice(streamIdx).join("/");

  let providerSlug = forcedSlug;
  if (!providerSlug) {
    const provider = findProviderForHost(parsed.hostname, providers);
    if (!provider) return null;
    providerSlug = provider.slug;
  }

  return { providerSlug, relativePath, streamType };
}

export function buildProviderPlayUrl(rawUrl, proxyBase, options = {}) {
  const parsed = parseIptvProviderUrl(rawUrl, options);
  if (!parsed) return null;

  const base = normalizeProxyBase(proxyBase);
  return `${base}/proxy/${parsed.providerSlug}/${parsed.relativePath}`;
}
