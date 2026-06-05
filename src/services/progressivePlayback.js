export async function loadProgressiveStream(video, playUrl) {
  video.removeAttribute("src");
  video.src = playUrl;
  video.load();

  try {
    await video.play();
  } catch {
    /* autoplay bloqué */
  }
}
