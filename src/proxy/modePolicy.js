import { PROXY_MODE } from "../config/defaults.js";

export function isAllmoviesMode(proxyMode) {
  return (
    proxyMode === PROXY_MODE.ALLMOVIES_GENERIC ||
    proxyMode === PROXY_MODE.ALLMOVIES_PROVIDER
  );
}

export function requiresHealthCheck(proxyMode) {
  return isAllmoviesMode(proxyMode);
}

export function requiresCdnDiscovery(proxyMode, viaProxy) {
  if (!viaProxy) return false;
  if (proxyMode === PROXY_MODE.ALLMOVIES_PROVIDER) return false;
  return true;
}

export function usesProviderRouting(proxyMode) {
  return proxyMode === PROXY_MODE.ALLMOVIES_PROVIDER;
}
