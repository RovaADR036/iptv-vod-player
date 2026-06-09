import { createPlayer } from "@videojs/react";
import { videoFeatures } from "@videojs/react/video";

/** Instance Video.js partagée — contrôles, sous-titres, plein écran, etc. */
export const VideoJsPlayer = createPlayer({ features: videoFeatures });
