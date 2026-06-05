import { useEffect } from "react";
import {
  SSL_PROXY_HINT,
  STATUS,
  VIDEO_ERROR_MESSAGES,
} from "../constants/messages.js";

export function useVideoElementErrors(videoRef, { useProxy, onStatus }) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onError = () => {
      const code = video.error?.code;
      const base = code
        ? VIDEO_ERROR_MESSAGES[code]
        : "Erreur de lecture.";
      const detail = video.error?.message ? ` (${video.error.message})` : "";
      const src = video.currentSrc || video.src || "";
      const sslLikely =
        !useProxy &&
        (src.includes("dvodcdn.xyz") || detail.includes("Format error"));
      onStatus(base + detail + (sslLikely ? SSL_PROXY_HINT : ""), true);
    };

    const onLoadedData = () => onStatus(STATUS.ready, false);

    video.addEventListener("error", onError);
    video.addEventListener("loadeddata", onLoadedData);

    return () => {
      video.removeEventListener("error", onError);
      video.removeEventListener("loadeddata", onLoadedData);
    };
  }, [videoRef, useProxy, onStatus]);
}
