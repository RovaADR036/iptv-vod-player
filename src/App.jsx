import { useRef } from "react";
import { AppShell } from "./components/AppShell/AppShell.jsx";
import { StreamConfigPanel } from "./components/StreamConfig/index.js";
import { VideoSurface } from "./components/VideoSurface/VideoSurface.jsx";
import { useAppPlayback } from "./hooks/useAppPlayback.js";

export default function App() {
  const videoRef = useRef(null);
  const { proxy, stream, status, handleSubmit } = useAppPlayback(videoRef);

  return (
    <AppShell
      overlay={
        <StreamConfigPanel
          streamUrl={stream.streamUrl}
          onStreamUrlChange={stream.setStreamUrl}
          onSubmit={handleSubmit}
          useProxy={proxy.useProxy}
          onUseProxyChange={proxy.toggleProxy}
          proxyMode={proxy.proxyMode}
          onProxyModeChange={proxy.updateProxyMode}
          proxyBase={proxy.proxyBase}
          onProxyBaseChange={proxy.updateProxyBase}
          providerSlug={proxy.providerSlug}
          onProviderSlugChange={proxy.updateProviderSlug}
          statusMessage={status.message}
          statusIsError={status.isError}
        />
      }
    >
      <VideoSurface ref={videoRef} />
    </AppShell>
  );
}
