import { PROXY_MODE } from "../config/defaults.js";
import { normalizeProxyBase } from "../utils/proxyUrl.js";

export async function checkProxyHealth(proxyBase) {
  const base = normalizeProxyBase(proxyBase);
  if (!base) return { ok: false, reason: "no-base" };

  try {
    const res = await fetch(`${base}/health`, {
      signal: AbortSignal.timeout(5000),
    });
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

/**
 * Valide que le proxy est prêt pour le mode demandé.
 * @returns {Promise<{ ok: true } | { ok: false, reason: string }>}
 */
export async function validateProxyForMode(proxySettings) {
  const health = await checkProxyHealth(proxySettings.proxyBase);

  if (health.ok) return { ok: true };

  if (
    health.reason === "generic-disabled" &&
    proxySettings.proxyMode !== PROXY_MODE.ALLMOVIES_GENERIC
  ) {
    return { ok: true };
  }

  return { ok: false, reason: health.reason };
}
