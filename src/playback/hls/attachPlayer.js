import { HLS_RESILIENT_CONFIG } from "../../config/hlsPlayback.js";
import { createProxyLoader } from "./proxyLoader.js";
import { Hls } from "./native.js";
import { wirePlaybackEvents } from "./wirePlaybackEvents.js";

export function attachHlsPlayer({
  video,
  playUrl,
  fixHlsRequestUrl,
  report,
  cdnOrigin,
}) {
  const ProxyLoader = createProxyLoader(fixHlsRequestUrl);
  const hlsOpts = { ...HLS_RESILIENT_CONFIG };

  if (ProxyLoader) {
    hlsOpts.loader = ProxyLoader;
    hlsOpts.fLoader = ProxyLoader;
    hlsOpts.pLoader = ProxyLoader;
  }

  const hls = new Hls(hlsOpts);

  const detach = wirePlaybackEvents(hls, { video, report, cdnOrigin });

  hls.loadSource(fixHlsRequestUrl(playUrl));
  hls.attachMedia(video);

  return { instance: hls, detach };
}
