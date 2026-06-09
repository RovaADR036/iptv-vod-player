# IPTV VOD Player

Lecteur web React pour tester des flux vidéo IPTV : **MP4**, **M3U8 (HLS)** et redirections CDN.

Deux modes proxy sont disponibles dans l’interface (via **allmovies-iptv-proxy** sur le port 3210) :

| Mode | Proxy | Usage |
|------|-------|-------|
| **Allmovies générique (3210)** | Route `/proxy?url=` | URL IPTV collée telle quelle |
| **Allmovies fournisseur (3210)** | Routes `/proxy/{slug}/movie/...` | Fournisseur configuré dans l’admin Redis |

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) — projet `allmovies-iptv-proxy` voisin

## Installation

```bash
cd iptv-vod-player
npm install
```

## Démarrage

**Terminal 1 — stack allmovies :**

```bash
cd ../allmovies-iptv-proxy
docker compose up
```

Vérifier que `.env` contient `GENERIC_PROXY_ENABLED=true` (activé par défaut).

**Terminal 2 — lecteur :**

```bash
cd iptv-vod-player
npm run dev
```

Ouvrir **http://localhost:5173/**.

Dans l’interface :

- **Allmovies générique** : coller l’URL IPTV complète (`http://line.../movie/.../film.m3u8`)
- **Allmovies fournisseur** : même URL ; le lecteur la convertit en `/proxy/{slug}/movie/...`. Configurer le fournisseur dans l’admin (`http://localhost:3211`) et aligner `src/config/providers.js`.

## Utilisation

1. Coller l’URL du flux
2. Cocher **Via proxy** et choisir le mode
3. Cliquer **Tester**

## Formats

| Format | Support |
|--------|---------|
| MP4    | Oui (via proxy) |
| M3U8   | Oui (hls.js + proxy) |
| MKV    | Limité (codec navigateur) |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance Vite (développement) |
| `npm run build` | Build production |
| `npm run preview` | Prévisualise le build |
| `npm run lint` | Vérification ESLint |

## Structure

```
iptv-vod-player/
├── src/
│   ├── components/      # UI React
│   ├── config/          # Constantes, modes proxy, fournisseurs
│   ├── hooks/           # État React (proxy, lecture, URL)
│   ├── proxy/           # Intégration proxy côté client
│   │   ├── hosts/       # Détection hôtes IPTV / routes allmovies
│   │   ├── parsers/     # Parsing URL fournisseur
│   │   ├── cdn/         # Analyse playlists m3u8
│   │   └── hls/         # Résolution URLs HLS par mode
│   ├── playback/        # Moteur de lecture (engine, HLS, MP4)
│   ├── services/        # Re-exports rétrocompatibles
│   └── utils/           # Utilitaires purs (proxyUrl, streamFormat)
├── docs/
└── package.json
```

## Documentation

- [Rôle du proxy et des formats](docs/proxy-et-formats.md)

## Licence

MIT
