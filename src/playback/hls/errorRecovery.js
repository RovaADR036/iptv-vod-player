/**
 * Recovery HLS — logique pure (testable sans DOM).
 * Checklist manuelle : Slow 3G DevTools, coupure réseau, flux M3U8 stable.
 */
import { PlaybackEvent } from "../../domain/playback/events.js";
import { Hls } from "./native.js";

export const MAX_RECOVERY_ATTEMPTS = 3;

/** @typedef {"startLoad" | "recoverMediaError" | "none" | "fatal"} RecoveryAction */

/**
 * @param {import("hls.js").ErrorData} data
 */
export function describeHlsError(data) {
  const fragUrl = data.frag?.url || "";
  let hint = "";

  if (fragUrl.includes("/hls/") && !fragUrl.includes("/proxy?url=")) {
    hint =
      " — rechargez la page après docker compose up (correctif CDN en cours)";
  }

  return {
    fatal: Boolean(data.fatal),
    type: data.type,
    details: data.details,
    fragUrl,
    hint,
  };
}

/**
 * @param {import("hls.js").ErrorData} data
 * @returns {RecoveryAction}
 */
export function getRecoveryAction(data) {
  if (!data.fatal) return "none";

  switch (data.type) {
    case Hls.ErrorTypes.NETWORK_ERROR:
      return "startLoad";
    case Hls.ErrorTypes.MEDIA_ERROR:
      return "recoverMediaError";
    default:
      return "fatal";
  }
}

/**
 * @param {import("hls.js").default} hls
 * @param {RecoveryAction} action
 */
export function applyRecoveryAction(hls, action) {
  switch (action) {
    case "startLoad":
      hls.startLoad();
      return true;
    case "recoverMediaError":
      hls.recoverMediaError();
      return true;
    default:
      return false;
  }
}

/**
 * @param {ReturnType<typeof describeHlsError>} described
 * @returns {{ event: string, context: Record<string, unknown> }}
 */
export function toFatalPlaybackEvent(described) {
  return {
    event: PlaybackEvent.HLS_FATAL_ERROR,
    context: {
      details: described.details,
      type: described.type,
      fragUrl: described.fragUrl,
      hint: described.hint,
    },
  };
}

/**
 * @param {ReturnType<typeof describeHlsError>} described
 * @returns {{ event: string, context: Record<string, unknown> }}
 */
export function toRecoveryFailedEvent(described) {
  return {
    event: PlaybackEvent.HLS_RECOVERY_FAILED,
    context: {
      details: described.details,
      type: described.type,
      fragUrl: described.fragUrl,
      hint: described.hint,
    },
  };
}

export function createRecoveryBudget(maxAttempts = MAX_RECOVERY_ATTEMPTS) {
  let attempts = 0;

  return {
    canRetry() {
      return attempts < maxAttempts;
    },
    consume() {
      attempts += 1;
    },
    reset() {
      attempts = 0;
    },
  };
}
