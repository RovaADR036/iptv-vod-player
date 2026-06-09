import { PROXY_MODE } from "../../config/defaults.js";
import { PROXY_BASE_HINTS, PROXY_MODE_OPTIONS } from "../../config/proxyModes.js";
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
}) {
  const showProviderSlug = proxyMode === PROXY_MODE.ALLMOVIES_PROVIDER;

  return (
    <form className="stream-test-bar" onSubmit={onSubmit}>
      <input
        type="text"
        className="stream-test-bar__input"
        value={streamUrl}
        onChange={(e) => onStreamUrlChange(e.target.value)}
        placeholder="URL de la vidéo (mp4, mkv, m3u8…)"
        autoComplete="off"
        spellCheck={false}
        aria-label="URL du flux vidéo"
      />
      <button type="submit" className="stream-test-bar__submit">
        Tester
      </button>
      <label className="stream-test-bar__proxy-label">
        <input
          type="checkbox"
          checked={useProxy}
          onChange={(e) => onUseProxyChange(e.target.checked)}
        />
        Via proxy
      </label>
      <select
        className="stream-test-bar__proxy-mode"
        value={proxyMode}
        onChange={(e) => onProxyModeChange(e.target.value)}
        disabled={!useProxy}
        aria-label="Mode proxy"
      >
        {PROXY_MODE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {showProviderSlug && (
        <input
          type="text"
          className="stream-test-bar__provider-slug"
          value={providerSlug}
          onChange={(e) => onProviderSlugChange(e.target.value)}
          placeholder="slug fournisseur"
          title="Identifiant du fournisseur configuré dans l'admin allmovies"
          aria-label="Slug fournisseur"
        />
      )}
      <input
        type="text"
        className="stream-test-bar__proxy-base"
        value={proxyBase}
        onChange={(e) => onProxyBaseChange(e.target.value)}
        disabled={!useProxy}
        title={PROXY_BASE_HINTS[proxyMode] ?? ""}
        aria-label="URL de base du proxy"
      />
    </form>
  );
}
