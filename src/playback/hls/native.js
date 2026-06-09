import Hls from "hls.js";

export function isHlsSupported() {
  return typeof Hls !== "undefined" && Hls.isSupported();
}

export async function loadNativeHls(video, playUrl) {
  video.src = playUrl;
  video.load();
  try {
    await video.play();
  } catch {
    /* Safari autoplay */
  }
}

export { Hls };
