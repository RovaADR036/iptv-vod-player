import { useCallback, useEffect, useRef } from "react";
import { createPlaybackEngine } from "../services/playbackEngine.js";

export function usePlaybackController({
  videoRef,
  proxySettings,
  setStatus,
  syncToAddressBar,
}) {
  const engineRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = createPlaybackEngine();
  }

  useEffect(() => {
    const engine = engineRef.current;
    return () => engine?.destroy();
  }, []);

  const loadStream = useCallback(
    async (rawUrl) => {
      const video = videoRef.current;
      if (!video) {
        setStatus("Lecteur non prêt.", true);
        return;
      }

      syncToAddressBar(rawUrl);

      await engineRef.current.load({
        video,
        rawUrl,
        proxySettings,
        onStatus: setStatus,
      });
    },
    [videoRef, proxySettings, setStatus, syncToAddressBar]
  );

  return { loadStream };
}
