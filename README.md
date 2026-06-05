# IPTV VOD Player

Lecteur web React pour tester des flux vidéo IPTV : **MP4**, **M3U8 (HLS)** et redirections CDN. Le proxy Node (`stream-proxy.mjs`) est requis pour les liens IPTV typiques.

## Prérequis

- [Node.js](https://nodejs.org/) 18+

## Installation

```bash
cd C:\dev\iptv-vod-player
npm install
```

## Démarrage

**Terminal 1 — proxy :**

```bash
npm run proxy
```

**Terminal 2 — application React :**

```bash
npm run dev
```

Ouvrir **http://localhost:5173/**

## Utilisation

1. Coller l’URL du flux (ex. `http://line.example/.../film.m3u8`)
2. Laisser **Via proxy local** coché (`http://127.0.0.1:3080`)
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
├── src/                 # Application React
│   ├── components/      # UI
│   ├── hooks/           # État React
│   ├── services/        # Lecture vidéo, HLS, CDN
│   └── utils/           # Fonctions pures
├── stream-proxy.mjs     # Proxy Node (partagé)
├── docs/                # Documentation
└── package.json
```

## Documentation

- [Rôle du proxy et des formats](docs/proxy-et-formats.md)

## Licence

MIT
