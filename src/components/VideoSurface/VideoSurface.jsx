import { forwardRef } from "react";
import { Video, VideoSkin } from "@videojs/react/video";
import "@videojs/react/video/skin.css";
import { ControlsInset } from "./ControlsInset.jsx";
import { LanguageMenuMock } from "./LanguageMenuMock.jsx";
import { VideoJsPlayer } from "./videoPlayer.js";
import "./VideoSurface.css";

export const VideoSurface = forwardRef(function VideoSurface(
  { className = "" },
  ref
) {
  return (
    <div className={`video-surface ${className}`.trim()}>
      <VideoJsPlayer.Provider>
        <VideoSkin className="video-surface__player">
          <Video ref={ref} className="video-surface__video" playsInline />
        </VideoSkin>
        <ControlsInset
          playerSelector=".video-surface__player"
          beforeSelector=".media-button--captions"
          name="language-menu"
        >
          <LanguageMenuMock />
        </ControlsInset>
      </VideoJsPlayer.Provider>
    </div>
  );
});
