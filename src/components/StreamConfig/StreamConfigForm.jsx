import { PROXY_MODE } from "../../config/defaults.js";
import { PROXY_BASE_HINTS, PROXY_MODE_OPTIONS } from "../../config/proxyModes.js";

export function StreamConfigForm({
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
    <form className="stream-config-form" onSubmit={onSubmit}>
      <p className="stream-config__title">Configuration du flux</p>

      <label className="stream-config-form__field">
        <span className="stream-config-form__label">URL vidéo</span>
        <input
          type="url"
          inputMode="url"
          enterKeyHint="go"
          className="stream-config-form__input"
          value={streamUrl}
          onChange={(e) => onStreamUrlChange(e.target.value)}
          placeholder="mp4, mkv, m3u8…"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <label className="stream-config-form__field stream-config-form__field--row">
        <input
          type="checkbox"
          checked={useProxy}
          onChange={(e) => onUseProxyChange(e.target.checked)}
        />
        <span>Via proxy</span>
      </label>

      <label className="stream-config-form__field">
        <span className="stream-config-form__label">Mode proxy</span>
        <select
          className="stream-config-form__select"
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
        <label className="stream-config-form__field">
          <span className="stream-config-form__label">Slug fournisseur</span>
          <input
            type="text"
            className="stream-config-form__input"
            value={providerSlug}
            onChange={(e) => onProviderSlugChange(e.target.value)}
            placeholder="slug"
            title="Identifiant du fournisseur configuré dans l'admin allmovies"
          />
        </label>
      )}

      <label className="stream-config-form__field">
        <span className="stream-config-form__label">URL proxy</span>
        <input
          type="url"
          inputMode="url"
          className="stream-config-form__input"
          value={proxyBase}
          onChange={(e) => onProxyBaseChange(e.target.value)}
          disabled={!useProxy}
          placeholder="http://localhost:3210"
          title={PROXY_BASE_HINTS[proxyMode] ?? ""}
        />
      </label>

      <button type="submit" className="stream-config-form__submit">
        Lire
      </button>
    </form>
  );
}
