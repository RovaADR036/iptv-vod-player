import { PlaybackEvent } from "../../domain/playback/events.js";
import {
  applyRecoveryAction,
  createRecoveryBudget,
  describeHlsError,
  getRecoveryAction,
  toFatalPlaybackEvent,
  toRecoveryFailedEvent,
} from "./errorRecovery.js";
import { Hls } from "./native.js";

/**
 * Branche les événements hls.js et vidéo sur le reporter métier.
 * @returns {() => void} detach — à appeler avant hls.destroy()
 */
export function wirePlaybackEvents(hls, { video, report, cdnOrigin }) {
  const recoveryBudget = createRecoveryBudget();
  let isBuffering = false;

  const onVideoWaiting = () => {
    if (isBuffering) return;
    isBuffering = true;
    report(PlaybackEvent.BUFFERING);
  };

  const onVideoPlaying = () => {
    if (!isBuffering) return;
    isBuffering = false;
    report(PlaybackEvent.BUFFER_RESUMED);
  };

  const onHlsError = (_, data) => {
    const described = describeHlsError(data);
    const action = getRecoveryAction(data);

    if (action === "none") return;

    if (action === "fatal") {
      const { event, context } = toFatalPlaybackEvent(described);
      report(event, context);
      return;
    }

    if (!recoveryBudget.canRetry()) {
      const { event, context } = toRecoveryFailedEvent(described);
      report(event, context);
      return;
    }

    recoveryBudget.consume();

    if (action === "startLoad") {
      report(PlaybackEvent.HLS_RECOVERING_NETWORK);
    } else if (action === "recoverMediaError") {
      report(PlaybackEvent.HLS_RECOVERING_MEDIA);
    }

    applyRecoveryAction(hls, action);
  };

  const onManifestParsed = () => {
    recoveryBudget.reset();
    report(PlaybackEvent.HLS_READY, { cdnOrigin });
    video.play().catch(() => {});
  };

  hls.on(Hls.Events.ERROR, onHlsError);
  hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
  video.addEventListener("waiting", onVideoWaiting);
  video.addEventListener("playing", onVideoPlaying);

  return function detach() {
    hls.off(Hls.Events.ERROR, onHlsError);
    hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
    video.removeEventListener("waiting", onVideoWaiting);
    video.removeEventListener("playing", onVideoPlaying);
  };
}
