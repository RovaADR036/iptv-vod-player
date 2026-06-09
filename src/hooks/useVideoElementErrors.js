import { useEffect } from "react";
import { PlaybackEvent } from "../domain/playback/events.js";
import { describeVideoElementError } from "../playback/videoElementErrors.js";

export function useVideoElementErrors(videoRef, { useProxy, report }) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onError = () => {
      const { event, context } = describeVideoElementError(video, { useProxy });
      report(event, context);
    };

    const onLoadedData = () => report(PlaybackEvent.READY);

    video.addEventListener("error", onError);
    video.addEventListener("loadeddata", onLoadedData);

    return () => {
      video.removeEventListener("error", onError);
      video.removeEventListener("loadeddata", onLoadedData);
    };
  }, [videoRef, useProxy, report]);
}
