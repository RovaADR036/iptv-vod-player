import { PROXY_MODE } from "../config/defaults.js";
import { buildProviderPlayUrl } from "./iptvUrlParser.js";

export function normalizeProxyBase(base) {
  return base.trim().replace(/\/$/, "");
}

export function buildProxiedUrl(rawUrl, proxyBase) {
  const base = normalizeProxyBase(proxyBase);
  return `${base}/proxy?url=${encodeURIComponent(rawUrl.trim())}`;
}

export function resolvePlayUrl(rawUrl, settings) {
  const trimmed = rawUrl.trim();
  if (!trimmed || !settings.useProxy) return trimmed;

  const base = normalizeProxyBase(settings.proxyBase);
  if (!base) return trimmed;

  if (settings.proxyMode === PROXY_MODE.ALLMOVIES_PROVIDER) {
    const providerUrl = buildProviderPlayUrl(trimmed, base, {
      slug: settings.providerSlug,
    });
    if (providerUrl) return providerUrl;
  }

  return buildProxiedUrl(trimmed, base);
}
