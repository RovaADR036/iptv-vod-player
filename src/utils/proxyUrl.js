/** Utilitaires purs de construction d'URL proxy (sans logique métier de mode). */

export function normalizeProxyBase(base) {
  return base.trim().replace(/\/$/, "");
}

export function buildProxiedUrl(rawUrl, proxyBase) {
  const base = normalizeProxyBase(proxyBase);
  return `${base}/proxy?url=${encodeURIComponent(rawUrl.trim())}`;
}
