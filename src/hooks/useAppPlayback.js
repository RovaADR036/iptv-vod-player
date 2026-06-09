import { useCallback, useEffect, useRef } from "react";
import { usePlaybackController } from "./usePlaybackController.js";
import { usePlaybackReporter } from "./usePlaybackReporter.js";
import { usePlaybackStatus } from "./usePlaybackStatus.js";
import { useProxySettings } from "./useProxySettings.js";
import { useStreamUrlQuery } from "./useStreamUrlQuery.js";
import { useVideoElementErrors } from "./useVideoElementErrors.js";

/**
 * Composition applicative : proxy, URL, statut et moteur de lecture.
 */
export function useAppPlayback(videoRef) {
  const initialLoadDone = useRef(false);

  const proxy = useProxySettings();
  const stream = useStreamUrlQuery();
  const status = usePlaybackStatus();
  const report = usePlaybackReporter(status.setStatus);

  const { loadStream } = usePlaybackController({
    videoRef,
    proxySettings: proxy.settings,
    report,
    syncToAddressBar: stream.syncToAddressBar,
  });

  useVideoElementErrors(videoRef, {
    useProxy: proxy.useProxy,
    report,
  });

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      loadStream(stream.streamUrl);
    },
    [loadStream, stream.streamUrl]
  );

  useEffect(() => {
    if (initialLoadDone.current || !stream.streamUrl.trim()) return;
    initialLoadDone.current = true;
    loadStream(stream.streamUrl);
  }, [stream.streamUrl, loadStream]);

  return {
    proxy,
    stream,
    status,
    loadStream,
    handleSubmit,
  };
}
