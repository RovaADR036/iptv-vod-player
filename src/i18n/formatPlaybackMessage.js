import { PlaybackEvent } from "../domain/playback/events.js";

const VIDEO_ERROR_MESSAGES = {
  1: "Lecture interrompue (réseau ou serveur).",
  2: "Format non supporté par le navigateur (essayez le .mp4).",
  3: "Décodage impossible (codec non supporté).",
  4: "URL non accessible ou refusée par le serveur.",
};

const SSL_PROXY_HINT =
  " Le flux est redirigé vers un CDN HTTPS (dvodcdn.xyz) dont le SSL est refusé par le navigateur — activez « Via proxy » et lancez docker compose up (allmovies-iptv-proxy).";

/**
 * @param {string} event
 * @param {Record<string, unknown>} [context]
 * @returns {{ message: string, isError: boolean }}
 */
export function formatPlaybackMessage(event, context = {}) {
  switch (event) {
    case PlaybackEvent.IDLE:
      return { message: "", isError: false };
    case PlaybackEvent.LOADING_DIRECT:
      return { message: "Chargement direct…", isError: false };
    case PlaybackEvent.LOADING_PROXY:
      return { message: "Chargement via proxy…", isError: false };
    case PlaybackEvent.LOADING_HLS:
      return { message: "Chargement flux HLS…", isError: false };
    case PlaybackEvent.LOADING_HLS_PROXY:
      return { message: "Chargement flux HLS via proxy…", isError: false };
    case PlaybackEvent.ANALYZING_CDN:
      return { message: "Analyse de la playlist (CDN)…", isError: false };
    case PlaybackEvent.READY:
      return { message: "Lecture prête.", isError: false };
    case PlaybackEvent.HLS_READY: {
      const cdn = context.cdnOrigin;
      const message = cdn
        ? `Flux HLS prêt (CDN : ${cdn}).`
        : "Flux HLS prêt.";
      return { message, isError: false };
    }
    case PlaybackEvent.PLAYER_NOT_READY:
      return { message: "Lecteur non prêt.", isError: true };
    case PlaybackEvent.CDN_NOT_FOUND:
      return {
        message:
          "CDN du flux non détecté — vérifiez que allmovies tourne (docker compose up) puis rechargez (Ctrl+F5).",
        isError: true,
      };
    case PlaybackEvent.PROXY_UNREACHABLE:
      return {
        message:
          "Proxy injoignable — lancez allmovies (docker compose up dans allmovies-iptv-proxy).",
        isError: true,
      };
    case PlaybackEvent.PROXY_GENERIC_DISABLED:
      return {
        message:
          "Le mode générique allmovies est désactivé — définissez GENERIC_PROXY_ENABLED=true puis reconstruisez le conteneur.",
        isError: true,
      };
    case PlaybackEvent.HLS_UNSUPPORTED:
      return {
        message:
          "HLS (.m3u8) non supporté ici. Utilisez Chrome/Edge/Firefox avec hls.js ou Safari.",
        isError: true,
      };
    case PlaybackEvent.VIDEO_ELEMENT_ERROR: {
      const code = context.code;
      const base = code
        ? VIDEO_ERROR_MESSAGES[code]
        : "Erreur de lecture.";
      const detail = context.mediaMessage
        ? ` (${context.mediaMessage})`
        : "";
      const sslHint = context.sslLikely ? SSL_PROXY_HINT : "";
      return { message: base + detail + sslHint, isError: true };
    }
    case PlaybackEvent.HLS_FATAL_ERROR: {
      const msg = context.details || context.type || "erreur HLS";
      const rawFrag = context.fragUrl || "";
      const frag = rawFrag
        ? ` Segment : ${String(rawFrag).slice(0, 140)}…`
        : "";
      let hint = context.hint || "";
      if (!hint && context.details === "fragParsingError") {
        hint = " (segment invalide ou format non TS)";
      }
      if (
        rawFrag.includes("/hls/") &&
        !rawFrag.includes("/proxy?url=")
      ) {
        hint +=
          " — rechargez la page après docker compose up (correctif CDN en cours)";
      }
      return { message: `Erreur HLS : ${msg}${hint}.${frag}`, isError: true };
    }
    default:
      return { message: "", isError: false };
  }
}
