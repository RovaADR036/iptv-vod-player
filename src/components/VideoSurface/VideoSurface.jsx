import { forwardRef } from "react";
import { Video, VideoSkin } from "@videojs/react/video";
import "@videojs/react/video/skin.css";
import { ControlsInset } from "./ControlsInset.jsx";
import {
  CAPTIONS_BUTTON_SELECTOR,
  LANGUAGE_MENU_INSET,
  VIDEO_PLAYER_SELECTOR,
} from "./constants.js";
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
          playerSelector={VIDEO_PLAYER_SELECTOR}
          beforeSelector={CAPTIONS_BUTTON_SELECTOR}
          name={LANGUAGE_MENU_INSET}
        >
          <LanguageMenuMock />
        </ControlsInset>
      </VideoJsPlayer.Provider>
    </div>
  );
});
