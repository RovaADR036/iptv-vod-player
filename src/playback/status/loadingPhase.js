import { PlaybackEvent } from "../../domain/playback/events.js";

export function getLoadingPhase(isHls, viaProxy) {
  if (isHls) {
    return viaProxy
      ? PlaybackEvent.LOADING_HLS_PROXY
      : PlaybackEvent.LOADING_HLS;
  }
  return viaProxy ? PlaybackEvent.LOADING_PROXY : PlaybackEvent.LOADING_DIRECT;
}
