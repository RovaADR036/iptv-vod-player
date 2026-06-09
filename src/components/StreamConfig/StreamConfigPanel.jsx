import { useDismissiblePanel } from "../../hooks/useDismissiblePanel.js";
import { PlaybackStatus } from "../PlaybackStatus/PlaybackStatus.jsx";
import { StreamConfigForm } from "./StreamConfigForm.jsx";
import "./StreamConfig.css";

export function StreamConfigPanel({
  streamUrl,
  onStreamUrlChange,
  onSubmit,
  useProxy,
  onUseProxyChange,
  proxyMode,
  onProxyModeChange,
  proxyBase,
  onProxyBaseChange,
  providerSlug,
  onProviderSlugChange,
  statusMessage = "",
  statusIsError = false,
}) {
  const { open, rootRef, togglePanel, closePanel } = useDismissiblePanel();

  const handleSubmit = (e) => {
    onSubmit(e);
    closePanel();
  };

  return (
    <div
      ref={rootRef}
      className={`stream-config ${open ? "stream-config--open" : ""} ${
        statusIsError ? "stream-config--error" : ""
      }`.trim()}
    >
      <button
        type="button"
        className="stream-config__toggle"
        aria-expanded={open}
        aria-controls="stream-config-panel"
        aria-label={open ? "Fermer les réglages" : "Ouvrir les réglages"}
        onClick={togglePanel}
      >
        <span className="stream-config__toggle-icon" aria-hidden>
          ⚙
        </span>
      </button>

      {open && (
        <div id="stream-config-panel" className="stream-config__panel">
          <StreamConfigForm
            streamUrl={streamUrl}
            onStreamUrlChange={onStreamUrlChange}
            onSubmit={handleSubmit}
            useProxy={useProxy}
            onUseProxyChange={onUseProxyChange}
            proxyMode={proxyMode}
            onProxyModeChange={onProxyModeChange}
            proxyBase={proxyBase}
            onProxyBaseChange={onProxyBaseChange}
            providerSlug={providerSlug}
            onProviderSlugChange={onProviderSlugChange}
          />

          {statusMessage ? (
            <PlaybackStatus message={statusMessage} isError={statusIsError} />
          ) : null}
        </div>
      )}
    </div>
  );
}
