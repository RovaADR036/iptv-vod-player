import { useCallback, useEffect, useRef } from "react";
import { PlaybackEvent } from "../domain/playback/events.js";
import { createPlaybackEngine } from "../playback/engine.js";

export function usePlaybackController({
  videoRef,
  proxySettings,
  report,
  syncToAddressBar,
}) {
  const engineRef = useRef(null);

  if (engineRef.current == null) {
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
        report(PlaybackEvent.PLAYER_NOT_READY);
        return;
      }

      syncToAddressBar(rawUrl);

      await engineRef.current.load({
        video,
        rawUrl,
        proxySettings,
        report,
      });
    },
    [videoRef, proxySettings, report, syncToAddressBar]
  );

  return { loadStream };
}
