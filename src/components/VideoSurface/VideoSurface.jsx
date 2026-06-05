import { forwardRef } from "react";
import "./VideoSurface.css";

export const VideoSurface = forwardRef(function VideoSurface(
  { className = "" },
  ref
) {
  return (
    <div className={`video-surface ${className}`.trim()}>
      <video
        ref={ref}
        className="video-surface__video"
        playsInline
        controls
      />
    </div>
  );
});
