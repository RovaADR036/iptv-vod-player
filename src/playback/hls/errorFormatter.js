import { PlaybackEvent } from "../../domain/playback/events.js";

/**
 * @param {import("hls.js").ErrorData} data
 * @returns {{ event: string, context: Record<string, unknown> }}
 */
export function describeHlsFatalError(data) {
  const fragUrl = data.frag?.url || "";
  let hint = "";

  if (fragUrl.includes("/hls/") && !fragUrl.includes("/proxy?url=")) {
    hint =
      " — rechargez la page après docker compose up (correctif CDN en cours)";
  }

  return {
    event: PlaybackEvent.HLS_FATAL_ERROR,
    context: {
      details: data.details,
      type: data.type,
      fragUrl,
      hint,
    },
  };
}
