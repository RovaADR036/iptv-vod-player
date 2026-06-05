import "./PlaybackStatus.css";

export function PlaybackStatus({ message, isError }) {
  return (
    <p
      className={`playback-status ${isError ? "playback-status--error" : "playback-status--ok"}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  );
}
