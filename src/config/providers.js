/**
 * Miroir simplifié des fournisseurs configurés dans l'admin allmovies (Redis).
 * upstreamHosts : hôtes reconnus dans les URLs IPTV collées par l'utilisateur.
 */
export const PROVIDERS = [
  {
    slug: "dndns",
    upstreamHosts: ["line.dndnscloud.ru"],
    upstreamBase: "http://line.dndnscloud.ru",
  },
];

export const DEFAULT_PROVIDER_SLUG = PROVIDERS[0]?.slug ?? "dndns";
