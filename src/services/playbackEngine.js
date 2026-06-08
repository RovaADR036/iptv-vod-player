import { PROXY_MODE } from "../config/defaults.js";
import { STATUS } from "../constants/messages.js";
import { isLineIptvOrigin } from "../utils/iptvHost.js";
import { resolvePlayUrl } from "../utils/proxyUrl.js";
import { isHlsUrl } from "../utils/streamFormat.js";
import { checkProxyHealth, discoverCdnOrigin } from "./cdnDiscovery.js";
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
  let proxySettingsRef = {
    useProxy: true,
    proxyBase: "",
    proxyMode: PROXY_MODE.LOCAL,
  };

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

  function isAllmoviesMode(proxyMode) {
    return (
      proxyMode === PROXY_MODE.ALLMOVIES_GENERIC ||
      proxyMode === PROXY_MODE.ALLMOVIES_PROVIDER
    );
  }

  function needsCdnDiscovery(proxySettings, viaProxy) {
    if (!viaProxy) return false;
    if (proxySettings.proxyMode === PROXY_MODE.ALLMOVIES_PROVIDER) return false;
    return true;
  }

  async function ensureProxyReady(proxySettings, onStatus) {
    if (!isAllmoviesMode(proxySettings.proxyMode)) return true;

    const health = await checkProxyHealth(proxySettings.proxyBase);
    if (health.reason === "unreachable") {
      onStatus(STATUS.proxyUnreachable, true);
      return false;
    }
    if (health.reason === "generic-disabled" &&
        proxySettings.proxyMode === PROXY_MODE.ALLMOVIES_GENERIC) {
      onStatus(STATUS.proxyGenericDisabled, true);
      return false;
    }
    return true;
  }

  async function load({ video, rawUrl, proxySettings, onStatus }) {
    const trimmed = rawUrl.trim();
    if (!trimmed) return;

    proxySettingsRef = proxySettings;
    const viaProxy = proxySettings.useProxy;

    if (viaProxy && !(await ensureProxyReady(proxySettings, onStatus))) {
      return;
    }

    const playUrl = resolvePlayUrl(trimmed, proxySettings);
    const proxied = playUrl !== trimmed;
    const hls = isHlsUrl(trimmed);

    onStatus(getLoadingStatus(hls, proxied), false);
    resetVideoElement(video);

    if (hls) {
      if (isHlsSupported()) {
        if (needsCdnDiscovery(proxySettings, proxied)) {
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
