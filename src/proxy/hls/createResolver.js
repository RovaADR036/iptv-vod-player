import { usesProviderRouting } from "../modePolicy.js";
import { resolveGenericHlsUrl } from "./genericResolver.js";
import { resolveProviderHlsUrl } from "./providerResolver.js";

/**
 * Fabrique un résolveur HLS adapté au mode proxy courant (Strategy pattern).
 */
export function createHlsUrlResolver({ getProxySettings, getCdnOrigin }) {
  function fixHlsRequestUrl(url) {
    const settings = getProxySettings();
    if (!settings.useProxy) return url;

    if (usesProviderRouting(settings.proxyMode)) {
      return resolveProviderHlsUrl(url, { proxyBase: settings.proxyBase });
    }

    return resolveGenericHlsUrl(url, {
      proxyBase: settings.proxyBase,
      cdnOrigin: getCdnOrigin(),
    });
  }

  return { fixHlsRequestUrl };
}
