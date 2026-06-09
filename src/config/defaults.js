export const DEFAULT_PROXY_BASE = "http://localhost:3210";

export const PROXY_MODE = {
  ALLMOVIES_GENERIC: "allmovies-generic",
  ALLMOVIES_PROVIDER: "allmovies-provider",
};

export const PROXY_MODE_BASE = {
  [PROXY_MODE.ALLMOVIES_GENERIC]: DEFAULT_PROXY_BASE,
  [PROXY_MODE.ALLMOVIES_PROVIDER]: DEFAULT_PROXY_BASE,
};

export { HLS_CONFIG, HLS_RESILIENT_CONFIG } from "./hlsPlayback.js";

export const CDN_DISCOVERY_MAX_DEPTH = 3;
