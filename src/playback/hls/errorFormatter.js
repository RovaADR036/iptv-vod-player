import { describeHlsError, toFatalPlaybackEvent } from "./errorRecovery.js";

/**
 * @param {import("hls.js").ErrorData} data
 * @returns {{ event: string, context: Record<string, unknown> }}
 */
export function describeHlsFatalError(data) {
  return toFatalPlaybackEvent(describeHlsError(data));
}
