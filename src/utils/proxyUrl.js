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
  return buildProxiedUrl(trimmed, base);
}
