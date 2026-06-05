import { STATUS } from "../constants/messages.js";
import { isLineIptvOrigin } from "../utils/iptvHost.js";
import { resolvePlayUrl } from "../utils/proxyUrl.js";
import { isHlsUrl } from "../utils/streamFormat.js";
import { discoverCdnOrigin } from "./cdnDiscovery.js";
import {
  attachHlsPlayer,
  isHlsSupported,
  loadNativeHls,
} from "./hlsPlayback.js";
import { disableHlsXhrPatch, enableHlsXhrPatch } from "./hlsXhrPatch.js";
import { createHlsUrlResolver } from "./hlsUrlResolver.js";
import { loadProgressiveStream } from "./progressivePlayback.js";

export function createPlaybackEngine() {
  let hlsInstance = null;
  let cdnOrigin = null;
  let proxySettingsRef = { useProxy: true, proxyBase: "" };

  const urlResolver = createHlsUrlResolver({
    getProxySettings: () => proxySettingsRef,
    getCdnOrigin: () => cdnOrigin,
  });

  function teardown() {
    disableHlsXhrPatch();
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    cdnOrigin = null;
  }

  function resetVideoElement(video) {
    teardown();
    video.removeAttribute("src");
    video.load();
  }

  function getLoadingStatus(hls, viaProxy) {
    if (hls) return viaProxy ? STATUS.loadingHlsProxy : STATUS.loadingHls;
    return viaProxy ? STATUS.loadingProxy : STATUS.loadingDirect;
  }

  async function load({ video, rawUrl, proxySettings, onStatus }) {
    const trimmed = rawUrl.trim();
    if (!trimmed) return;

    proxySettingsRef = proxySettings;
    const playUrl = resolvePlayUrl(trimmed, proxySettings);
    const viaProxy = playUrl !== trimmed;
    const hls = isHlsUrl(trimmed);

    onStatus(getLoadingStatus(hls, viaProxy), false);
    resetVideoElement(video);

    if (hls) {
      if (isHlsSupported()) {
        if (viaProxy) {
          onStatus(STATUS.analyzingCdn, false);
          cdnOrigin = await discoverCdnOrigin(
            playUrl,
            proxySettings.proxyBase
          );
          if (!cdnOrigin || isLineIptvOrigin(cdnOrigin)) {
            onStatus(STATUS.cdnNotFound, true);
            return;
          }
        }

        enableHlsXhrPatch(urlResolver.fixHlsRequestUrl);

        hlsInstance = attachHlsPlayer({
          video,
          playUrl,
          fixHlsRequestUrl: urlResolver.fixHlsRequestUrl,
          onStatus,
          cdnOrigin,
        });
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        await loadNativeHls(video, playUrl);
        onStatus(STATUS.hlsReady(null), false);
        return;
      }

      onStatus(STATUS.hlsUnsupported, true);
      return;
    }

    await loadProgressiveStream(video, playUrl);
  }

  return {
    load,
    destroy: teardown,
  };
}
