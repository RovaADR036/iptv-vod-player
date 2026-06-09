# IPTV VOD Player

Lecteur web React pour tester des flux vidéo IPTV : **MP4**, **M3U8 (HLS)** et redirections CDN.

Trois modes proxy sont disponibles dans l’interface :

| Mode | Proxy | Usage |
|------|-------|-------|
| **Proxy local (3080)** | `stream-proxy.mjs` | Test rapide, une URL collée telle quelle |
| **Allmovies générique (3210)** | `allmovies-iptv-proxy` route `/proxy?url=` | Même UX que le proxy local, via Docker |
| **Allmovies fournisseur (3210)** | Routes `/proxy/{slug}/movie/...` | Fournisseur configuré dans l’admin Redis |

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- Pour les modes Allmovies : [Docker](https://www.docker.com/) (projet `allmovies-iptv-proxy` voisin)

## Installation

```bash
cd iptv-vod-player
npm install
```

## Démarrage — mode proxy local

**Terminal 1 — proxy :**

```bash
npm run proxy
```

**Terminal 2 — application React :**

```bash
npm run dev
```

Ouvrir **http://localhost:5173/** — sélectionner **Proxy local (3080)**.

## Démarrage — modes Allmovies

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
| `npm run proxy` | Lance le proxy flux sur le port 3080 |
| `npm run dev` | Lance Vite (développement) |
| `npm run build` | Build production |
| `npm run preview` | Prévisualise le build |

## Structure

```
iptv-vod-player/
├── proxy-server/        # Proxy local modulaire (port 3080)
│   ├── handlers.js      # Routage HTTP
│   ├── upstream-pipe.js # Relais upstream + réécriture m3u8
│   └── create-server.js # Factory serveur
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
├── stream-proxy.mjs     # Point d'entrée proxy local
├── docs/
└── package.json
```

## Documentation

- [Rôle du proxy et des formats](docs/proxy-et-formats.md)

## Licence

MIT
