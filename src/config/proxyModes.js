import { PROXY_MODE } from "./defaults.js";

export const PROXY_MODE_OPTIONS = [
  { value: PROXY_MODE.LOCAL, label: "Proxy local (3080)" },
  { value: PROXY_MODE.ALLMOVIES_GENERIC, label: "Allmovies générique (3210)" },
  { value: PROXY_MODE.ALLMOVIES_PROVIDER, label: "Allmovies fournisseur (3210)" },
];

export const PROXY_BASE_HINTS = {
  [PROXY_MODE.LOCAL]: "Lancer : npm run proxy",
  [PROXY_MODE.ALLMOVIES_GENERIC]: "Lancer : docker compose up (allmovies-iptv-proxy)",
  [PROXY_MODE.ALLMOVIES_PROVIDER]: "Lancer : docker compose up + admin fournisseur",
};
