import { STATUS } from "../../constants/messages.js";
import { requiresCdnDiscovery } from "../../proxy/modePolicy.js";
import { isLineIptvOrigin } from "../../proxy/hosts/lineIptv.js";
import { discoverCdnOrigin } from "../cdnDiscovery.js";
import { attachHlsPlayer } from "./attachPlayer.js";
import { isHlsSupported, loadNativeHls } from "./native.js";
import { enableHlsXhrPatch } from "./xhrPatch.js";

export async function loadHlsStream({
  video,
  playUrl,
  proxied,
  proxySettings,
  urlResolver,
  onStatus,
  setCdnOrigin,
  setHlsInstance,
}) {
  if (!isHlsSupported()) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      await loadNativeHls(video, playUrl);
      onStatus(STATUS.hlsReady(null), false);
      return true;
    }
    onStatus(STATUS.hlsUnsupported, true);
    return false;
  }

  let cdnOrigin = null;

  if (requiresCdnDiscovery(proxySettings.proxyMode, proxied)) {
    onStatus(STATUS.analyzingCdn, false);
    cdnOrigin = await discoverCdnOrigin(playUrl, proxySettings.proxyBase);
    if (!cdnOrigin || isLineIptvOrigin(cdnOrigin)) {
      onStatus(STATUS.cdnNotFound, true);
      return false;
    }
  }

  setCdnOrigin(cdnOrigin);
  enableHlsXhrPatch(urlResolver.fixHlsRequestUrl);

  const hls = attachHlsPlayer({
    video,
    playUrl,
    fixHlsRequestUrl: urlResolver.fixHlsRequestUrl,
    onStatus,
    cdnOrigin,
  });

  setHlsInstance(hls);
  return true;
}
