import { HLS_CONFIG } from "../../config/defaults.js";
import { STATUS } from "../../constants/messages.js";
import { formatHlsFatalError } from "./errorFormatter.js";
import { Hls } from "./native.js";
import { createProxyLoader } from "./proxyLoader.js";

export function attachHlsPlayer({
  video,
  playUrl,
  fixHlsRequestUrl,
  onStatus,
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
    onStatus(formatHlsFatalError(data), true);
  });

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    onStatus(STATUS.hlsReady(cdnOrigin), false);
    video.play().catch(() => {});
  });

  hls.loadSource(fixHlsRequestUrl(playUrl));
  hls.attachMedia(video);

  return hls;
}
