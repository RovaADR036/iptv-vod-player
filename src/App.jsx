import { useCallback, useEffect, useRef } from "react";
import { AppShell } from "./components/AppShell/AppShell.jsx";
import { StreamTestBar } from "./components/StreamTestBar/StreamTestBar.jsx";
import { VideoSurface } from "./components/VideoSurface/VideoSurface.jsx";
import { usePlaybackController } from "./hooks/usePlaybackController.js";
import { usePlaybackStatus } from "./hooks/usePlaybackStatus.js";
import { useProxySettings } from "./hooks/useProxySettings.js";
import { useStreamUrlQuery } from "./hooks/useStreamUrlQuery.js";
import { useVideoElementErrors } from "./hooks/useVideoElementErrors.js";

export default function App() {
  const videoRef = useRef(null);
  const initialLoadDone = useRef(false);

  const {
    settings,
    useProxy,
    proxyMode,
    proxyBase,
    providerSlug,
    toggleProxy,
    updateProxyBase,
    updateProxyMode,
    updateProviderSlug,
  } = useProxySettings();
  const { streamUrl, setStreamUrl, syncToAddressBar } = useStreamUrlQuery();
  const { message, isError, setStatus } = usePlaybackStatus();

  const { loadStream } = usePlaybackController({
    videoRef,
    proxySettings: settings,
    setStatus,
    syncToAddressBar,
  });

  useVideoElementErrors(videoRef, { useProxy, onStatus: setStatus });

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      loadStream(streamUrl);
    },
    [loadStream, streamUrl]
  );

  useEffect(() => {
    if (initialLoadDone.current || !streamUrl.trim()) return;
    initialLoadDone.current = true;
    loadStream(streamUrl);
  }, [streamUrl, loadStream]);

  return (
    <AppShell
      overlay={
        <StreamTestBar
          streamUrl={streamUrl}
          onStreamUrlChange={setStreamUrl}
          onSubmit={handleSubmit}
          useProxy={useProxy}
          onUseProxyChange={toggleProxy}
          proxyMode={proxyMode}
          onProxyModeChange={updateProxyMode}
          proxyBase={proxyBase}
          onProxyBaseChange={updateProxyBase}
          providerSlug={providerSlug}
          onProviderSlugChange={updateProviderSlug}
          statusMessage={message}
          statusIsError={isError}
        />
      }
    >
      <VideoSurface ref={videoRef} />
    </AppShell>
  );
}
