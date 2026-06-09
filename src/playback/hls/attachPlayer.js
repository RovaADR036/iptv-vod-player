import { HLS_CONFIG } from "../../config/defaults.js";
import { PlaybackEvent } from "../../domain/playback/events.js";
import { describeHlsFatalError } from "./errorFormatter.js";
import { Hls } from "./native.js";
import { createProxyLoader } from "./proxyLoader.js";

export function attachHlsPlayer({
  video,
  playUrl,
  fixHlsRequestUrl,
  report,
  cdnOrigin,
}) {
  const ProxyLoader = createProxyLoader(fixHlsRequestUrl);
  const hlsOpts = { ...HLS_CONFIG };

  if (ProxyLoader) {
    hlsOpts.loader = ProxyLoader;
    hlsOpts.fLoader = ProxyLoader;
    hlsOpts.pLoader = ProxyLoader;
  }

  const hls = new Hls(hlsOpts);

  hls.on(Hls.Events.ERROR, (_, data) => {
    if (!data.fatal) return;
    const { event, context } = describeHlsFatalError(data);
    report(event, context);
  });

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    report(PlaybackEvent.HLS_READY, { cdnOrigin });
    video.play().catch(() => {});
  });

  hls.loadSource(fixHlsRequestUrl(playUrl));
  hls.attachMedia(video);

  return hls;
}
