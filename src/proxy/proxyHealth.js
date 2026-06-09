import { PROXY_MODE } from "../config/defaults.js";
import { STATUS } from "../constants/messages.js";
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

const HEALTH_ERROR_STATUS = {
  unreachable: STATUS.proxyUnreachable,
  "generic-disabled": STATUS.proxyGenericDisabled,
};

/**
 * Valide que le proxy est prêt pour le mode demandé.
 * Retourne null si OK, sinon le message d'erreur à afficher.
 */
export async function validateProxyForMode(proxySettings) {
  const health = await checkProxyHealth(proxySettings.proxyBase);

  if (health.ok) return null;

  if (
    health.reason === "generic-disabled" &&
    proxySettings.proxyMode !== PROXY_MODE.ALLMOVIES_GENERIC
  ) {
    return null;
  }

  return HEALTH_ERROR_STATUS[health.reason] ?? STATUS.proxyUnreachable;
}
