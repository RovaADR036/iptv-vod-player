import { PlaybackEvent } from "../domain/playback/events.js";

/**
 * @param {HTMLVideoElement} video
 * @param {{ useProxy: boolean }} options
 * @returns {{ event: string, context: Record<string, unknown> }}
 */
export function describeVideoElementError(video, { useProxy }) {
  const code = video.error?.code;
  const mediaMessage = video.error?.message ?? "";
  const src = video.currentSrc || video.src || "";
  const sslLikely =
    !useProxy &&
    (src.includes("dvodcdn.xyz") || mediaMessage.includes("Format error"));

  return {
    event: PlaybackEvent.VIDEO_ELEMENT_ERROR,
    context: { code, mediaMessage, src, sslLikely },
  };
}
