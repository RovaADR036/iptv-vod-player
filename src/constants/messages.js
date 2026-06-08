export const VIDEO_ERROR_MESSAGES = {
  1: "Lecture interrompue (réseau ou serveur).",
  2: "Format non supporté par le navigateur (essayez le .mp4).",
  3: "Décodage impossible (codec non supporté).",
  4: "URL non accessible ou refusée par le serveur.",
};

export const SSL_PROXY_HINT =
  " Le flux est redirigé vers un CDN HTTPS (dvodcdn.xyz) dont le SSL est refusé par le navigateur — activez « Via proxy local » et lancez npm run proxy.";

export const STATUS = {
  idle: "",
  loadingDirect: "Chargement direct…",
  loadingProxy: "Chargement via proxy local…",
  loadingHls: "Chargement flux HLS…",
  loadingHlsProxy: "Chargement flux HLS via proxy…",
  analyzingCdn: "Analyse de la playlist (CDN)…",
  ready: "Lecture prête.",
  hlsReady: (cdn) =>
    cdn ? `Flux HLS prêt (CDN : ${cdn}).` : "Flux HLS prêt.",
  playerNotReady: "Lecteur non prêt.",
  cdnNotFound:
    "CDN du flux non détecté — vérifiez que le proxy tourne (npm run proxy ou docker compose up) puis rechargez (Ctrl+F5).",
  proxyUnreachable:
    "Proxy injoignable — lancez allmovies (docker compose up) ou le proxy local (npm run proxy).",
  proxyGenericDisabled:
    "Le mode générique allmovies est désactivé — définissez GENERIC_PROXY_ENABLED=true puis reconstruisez le conteneur.",
  providerNotConfigured:
    "Fournisseur introuvable — configurez-le dans l'admin allmovies (http://localhost:3211) avec le même slug.",
  hlsUnsupported:
    "HLS (.m3u8) non supporté ici. Utilisez Chrome/Edge/Firefox avec hls.js ou Safari.",
};
