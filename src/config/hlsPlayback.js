/** Configuration hls.js orientée connexions instables (buffer, retry, ABR). */
export const HLS_RESILIENT_CONFIG = {
  enableWorker: true,
  lowLatencyMode: false,
  enableSoftwareAES: true,
  maxBufferLength: 60,
  maxMaxBufferLength: 120,
  maxBufferSize: 60 * 1000 * 1000,
  fragLoadingMaxRetry: 6,
  fragLoadingRetryDelay: 1000,
  manifestLoadingMaxRetry: 4,
  manifestLoadingRetryDelay: 1000,
  levelLoadingMaxRetry: 4,
  startLevel: -1,
  capLevelToPlayerSize: true,
  abrEwmaDefaultEstimate: 500_000,
};

/** @deprecated Utiliser HLS_RESILIENT_CONFIG */
export const HLS_CONFIG = HLS_RESILIENT_CONFIG;
