import { useMemo } from "react";
import { createPlaybackReporter } from "../playback/reporting/createReporter.js";

/**
 * Pont React : événements métier → messages UI.
 */
export function usePlaybackReporter(setStatus) {
  return useMemo(() => createPlaybackReporter(setStatus), [setStatus]);
}
