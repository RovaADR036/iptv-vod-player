/** Codes métier de lecture — sans texte UI. */
export const PlaybackEvent = {
  IDLE: "idle",
  LOADING_DIRECT: "loading_direct",
  LOADING_PROXY: "loading_proxy",
  LOADING_HLS: "loading_hls",
  LOADING_HLS_PROXY: "loading_hls_proxy",
  ANALYZING_CDN: "analyzing_cdn",
  READY: "ready",
  HLS_READY: "hls_ready",
  PLAYER_NOT_READY: "player_not_ready",
  CDN_NOT_FOUND: "cdn_not_found",
  PROXY_UNREACHABLE: "proxy_unreachable",
  PROXY_GENERIC_DISABLED: "proxy_generic_disabled",
  HLS_UNSUPPORTED: "hls_unsupported",
  VIDEO_ELEMENT_ERROR: "video_element_error",
  HLS_FATAL_ERROR: "hls_fatal_error",
};
