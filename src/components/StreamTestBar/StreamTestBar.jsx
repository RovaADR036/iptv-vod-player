import { useCallback, useEffect, useRef, useState } from "react";
import { PROXY_MODE } from "../../config/defaults.js";
import { PROXY_BASE_HINTS, PROXY_MODE_OPTIONS } from "../../config/proxyModes.js";
import { PlaybackStatus } from "../PlaybackStatus/PlaybackStatus.jsx";
import "./StreamTestBar.css";

export function StreamTestBar({
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const showProviderSlug = proxyMode === PROXY_MODE.ALLMOVIES_PROVIDER;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close();
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const handleSubmit = (e) => {
    onSubmit(e);
    close();
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
        onClick={() => setOpen((v) => !v)}
      >
        <span className="stream-config__toggle-icon" aria-hidden>
          ⚙
        </span>
      </button>

      {open && (
        <div id="stream-config-panel" className="stream-config__panel">
          <form className="stream-test-bar" onSubmit={handleSubmit}>
            <p className="stream-config__title">Configuration du flux</p>

            <label className="stream-test-bar__field">
              <span className="stream-test-bar__label">URL vidéo</span>
              <input
                type="url"
                inputMode="url"
                enterKeyHint="go"
                className="stream-test-bar__input"
                value={streamUrl}
                onChange={(e) => onStreamUrlChange(e.target.value)}
                placeholder="mp4, mkv, m3u8…"
                autoComplete="off"
                spellCheck={false}
              />
            </label>

            <label className="stream-test-bar__field stream-test-bar__field--row">
              <input
                type="checkbox"
                checked={useProxy}
                onChange={(e) => onUseProxyChange(e.target.checked)}
              />
              <span>Via proxy</span>
            </label>

            <label className="stream-test-bar__field">
              <span className="stream-test-bar__label">Mode proxy</span>
              <select
                className="stream-test-bar__proxy-mode"
                value={proxyMode}
                onChange={(e) => onProxyModeChange(e.target.value)}
                disabled={!useProxy}
              >
                {PROXY_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {showProviderSlug && (
              <label className="stream-test-bar__field">
                <span className="stream-test-bar__label">Slug fournisseur</span>
                <input
                  type="text"
                  className="stream-test-bar__provider-slug"
                  value={providerSlug}
                  onChange={(e) => onProviderSlugChange(e.target.value)}
                  placeholder="slug"
                  title="Identifiant du fournisseur configuré dans l'admin allmovies"
                />
              </label>
            )}

            <label className="stream-test-bar__field">
              <span className="stream-test-bar__label">URL proxy</span>
              <input
                type="url"
                inputMode="url"
                className="stream-test-bar__proxy-base"
                value={proxyBase}
                onChange={(e) => onProxyBaseChange(e.target.value)}
                disabled={!useProxy}
                placeholder="http://localhost:3210"
                title={PROXY_BASE_HINTS[proxyMode] ?? ""}
              />
            </label>

            <button type="submit" className="stream-test-bar__submit">
              Lire
            </button>
          </form>

          {statusMessage ? (
            <PlaybackStatus message={statusMessage} isError={statusIsError} />
          ) : null}
        </div>
      )}
    </div>
  );
}
