/** Rétrocompatibilité — délègue à playback/hls/. */
export { createProxyLoader } from "../playback/hls/proxyLoader.js";
export { attachHlsPlayer } from "../playback/hls/attachPlayer.js";
export { isHlsSupported, loadNativeHls, Hls } from "../playback/hls/native.js";
