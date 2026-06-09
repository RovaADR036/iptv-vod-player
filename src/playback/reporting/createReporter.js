import { formatPlaybackMessage } from "../../i18n/formatPlaybackMessage.js";

/**
 * Adapte les événements métier vers le callback UI (message + isError).
 * @param {(message: string, isError?: boolean) => void} onStatus
 */
export function createPlaybackReporter(onStatus) {
  return function report(event, context = {}) {
    const { message, isError } = formatPlaybackMessage(event, context);
    onStatus(message, isError);
  };
}
