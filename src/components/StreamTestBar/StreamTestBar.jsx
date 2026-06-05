import "./StreamTestBar.css";

export function StreamTestBar({
  streamUrl,
  onStreamUrlChange,
  onSubmit,
  useProxy,
  onUseProxyChange,
  proxyBase,
  onProxyBaseChange,
}) {
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
        Via proxy local
      </label>
      <input
        type="text"
        className="stream-test-bar__proxy-base"
        value={proxyBase}
        onChange={(e) => onProxyBaseChange(e.target.value)}
        title="Lancer : npm run proxy"
        aria-label="URL de base du proxy local"
      />
    </form>
  );
}
