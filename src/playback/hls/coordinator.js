import { PlaybackEvent } from "../../domain/playback/events.js";
import { discoverCdnOrigin } from "../../proxy/cdn/discoverOrigin.js";
import { requiresCdnDiscovery } from "../../proxy/modePolicy.js";
import { isLineIptvOrigin } from "../../proxy/hosts/lineIptv.js";
import { attachHlsPlayer } from "./attachPlayer.js";
import { isHlsSupported, loadNativeHls } from "./native.js";
import { enableHlsXhrPatch } from "./xhrPatch.js";

export async function loadHlsStream({
  video,
  playUrl,
  proxied,
  proxySettings,
  urlResolver,
  report,
  setCdnOrigin,
  setHlsInstance,
}) {
  if (!isHlsSupported()) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      await loadNativeHls(video, playUrl);
      report(PlaybackEvent.HLS_READY, { cdnOrigin: null });
      return true;
    }
    report(PlaybackEvent.HLS_UNSUPPORTED);
    return false;
  }

  let cdnOrigin = null;

  if (requiresCdnDiscovery(proxySettings.proxyMode, proxied)) {
    report(PlaybackEvent.ANALYZING_CDN);
    cdnOrigin = await discoverCdnOrigin(playUrl, proxySettings.proxyBase);
    if (!cdnOrigin || isLineIptvOrigin(cdnOrigin)) {
      report(PlaybackEvent.CDN_NOT_FOUND);
      return false;
    }
  }

  setCdnOrigin(cdnOrigin);
  enableHlsXhrPatch(urlResolver.fixHlsRequestUrl);

  const hls = attachHlsPlayer({
    video,
    playUrl,
    fixHlsRequestUrl: urlResolver.fixHlsRequestUrl,
    report,
    cdnOrigin,
  });

  setHlsInstance(hls);
  return true;
}
