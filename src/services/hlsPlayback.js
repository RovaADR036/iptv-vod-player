import Hls from "hls.js";
import { HLS_CONFIG } from "../config/defaults.js";
import { STATUS } from "../constants/messages.js";

export function createProxyLoader(fixHlsRequestUrl) {
  const Base = Hls.DefaultConfig?.loader;
  if (!Base) return null;

  return class ProxyLoader extends Base {
    load(context, config, callbacks) {
      context.url = fixHlsRequestUrl(context.url);
      super.load(context, config, callbacks);
    }
  };
}

export function isHlsSupported() {
  return typeof Hls !== "undefined" && Hls.isSupported();
}

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
    const msg = data.details || data.type || "erreur HLS";
    const rawFrag = data.frag?.url || "";
    const frag = rawFrag ? ` Segment : ${rawFrag.slice(0, 140)}…` : "";
    let hint =
      data.details === "fragParsingError"
        ? " (segment invalide ou format non TS)"
        : "";
    if (rawFrag.includes("/hls/") && !rawFrag.includes("/proxy?url=")) {
      hint +=
        " — rechargez la page après npm run proxy (correctif CDN en cours)";
    }
    onStatus(`Erreur HLS : ${msg}${hint}.${frag}`, true);
  });

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    onStatus(STATUS.hlsReady(cdnOrigin), false);
    video.play().catch(() => {});
  });

  hls.loadSource(fixHlsRequestUrl(playUrl));
  hls.attachMedia(video);

  return hls;
}

export async function loadNativeHls(video, playUrl) {
  video.src = playUrl;
  video.load();
  try {
    await video.play();
  } catch {
    /* Safari */
  }
}

export { Hls };
