import { createHlsUrlResolver } from "../proxy/hls/createResolver.js";
import { requiresHealthCheck } from "../proxy/modePolicy.js";
import { resolvePlayUrl } from "../proxy/playUrlResolver.js";
import { validateProxyForMode } from "../proxy/proxyHealth.js";
import { isHlsUrl } from "../utils/streamFormat.js";
import { loadHlsStream } from "./hls/coordinator.js";
import { disableHlsXhrPatch } from "./hls/xhrPatch.js";
import { getLoadingStatus } from "./loadingStatus.js";
import { loadProgressiveStream } from "./progressive.js";

/**
 * Orchestrateur de lecture — coordonne proxy, HLS et flux progressif.
 */
export function createPlaybackEngine() {
  let hlsInstance = null;
  let cdnOrigin = null;
  let proxySettingsRef = {};

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

  async function load({ video, rawUrl, proxySettings, onStatus }) {
    const trimmed = rawUrl.trim();
    if (!trimmed) return;

    proxySettingsRef = proxySettings;

    if (proxySettings.useProxy && requiresHealthCheck(proxySettings.proxyMode)) {
      const errorMessage = await validateProxyForMode(proxySettings);
      if (errorMessage) {
        onStatus(errorMessage, true);
        return;
      }
    }

    const playUrl = resolvePlayUrl(trimmed, proxySettings);
    const proxied = playUrl !== trimmed;
    const hls = isHlsUrl(trimmed);

    onStatus(getLoadingStatus(hls, proxied), false);
    resetVideoElement(video);

    if (hls) {
      await loadHlsStream({
        video,
        playUrl,
        proxied,
        proxySettings,
        urlResolver,
        onStatus,
        setCdnOrigin: (origin) => { cdnOrigin = origin; },
        setHlsInstance: (instance) => { hlsInstance = instance; },
      });
      return;
    }

    await loadProgressiveStream(video, playUrl);
  }

  return { load, destroy: teardown };
}
