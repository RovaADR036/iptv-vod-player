# Pourquoi le proxy local est nécessaire

Ce document explique le rôle du proxy (`stream-proxy.mjs`, `http://127.0.0.1:3080`) dans le lecteur polivalent, et pourquoi il est indispensable pour lire des flux IPTV en **MP4**, **M3U8 (HLS)** et, dans une moindre mesure, **MKV**.

## Contexte : le navigateur et les serveurs IPTV

Le lecteur s’exécute dans le navigateur (Chrome, Firefox, Edge, etc.). La page est servie depuis `localhost`, tandis que les vidéos IPTV proviennent d’autres domaines (`line.dndnscloud.ru`, CDN du type `dvodcdn.xyz`, etc.).

Le navigateur applique des règles de sécurité strictes : une page locale n’a pas le droit de télécharger librement des fichiers sur un autre site sans accord explicite de ce site. C’est la politique **CORS**. En pratique, beaucoup de serveurs IPTV ne renvoient pas les en-têtes qui autorisent la page à lire le flux directement — la requête est bloquée avant même que la vidéo n’arrive.

Le proxy est un petit serveur Node qui tourne sur votre machine, à côté du navigateur. Au lieu d’aller chercher la vidéo sur Internet, le navigateur demande tout au proxy local ; c’est le proxy qui contacte le serveur IPTV, suit les redirections, gère le HTTPS parfois capricieux, et renvoie les données au lecteur en ajoutant les en-têtes qui autorisent la lecture (`Access-Control-Allow-Origin`).

Pour le navigateur, la source ressemble à une ressource locale de confiance, alors que derrière le proxy continue de parler au vrai fournisseur de flux.

**Démarrage :**

```bash
npm run proxy
```

Dans l’interface, laissez **Via proxy local** coché (`http://127.0.0.1:3080`).

---

## MP4

Un fichier MP4 est en général un seul gros fichier (ou quelques morceaux avec reprise via les requêtes `Range`). Le lecteur vidéo du navigateur sait le lire nativement, mais il doit pouvoir **atteindre** l’URL et **recevoir** les octets.

Avec une URL IPTV directe, on se heurte souvent à :

- **CORS** — le serveur refuse la lecture depuis une page web ;
- **SSL** — certificats refusés sur certains CDN ;
- **Redirections** — chaînes d’URLs que le lecteur ne gère pas aussi bien qu’un serveur intermédiaire.

Le proxy joue le rôle d’intermédiaire de confiance : il récupère le MP4 (y compris par morceaux si vous avancez dans la timeline), transmet les en-têtes de taille et de plage, et renvoie le flux au navigateur sans que celui-ci négocie directement avec un domaine distant.

Sans proxy, un MP4 « public » sur un CDN ouvert peut parfois fonctionner ; pour les liens typiques IPTV de ce projet, le proxy est **obligatoire**.

---

## M3U8 (HLS)

Le format M3U8 n’est pas une vidéo en soi : c’est une **playlist texte** qui liste des petits segments (souvent des fichiers `.ts` ou `.m4s`). Le lecteur (hls.js) charge d’abord la playlist, puis enchaîne des dizaines ou centaines de requêtes vers d’autres URLs.

C’est là que le proxy devient vraiment indispensable, pas seulement utile.

1. **CORS** — chaque segment aurait le même problème qu’un MP4 direct.
2. **Redirections et CDN** — les flux IPTV passent souvent par une chaîne : URL sur un hôte « line », redirections vers un CDN HTTPS, chemins relatifs du type `/hls/...` qui ne veulent rien dire sans le bon serveur en tête.
3. **Réécriture des playlists** — le proxy ne se contente pas de relayer : il modifie le contenu des fichiers m3u8 pour que chaque ligne pointe à nouveau vers `http://127.0.0.1:3080/proxy?url=...`, mémorise quel CDN utiliser après les redirections, et peut relayer les segments même quand la playlist ne donne qu’un chemin court.

Sans cette réécriture, hls.js chargerait la première playlist via le proxy puis tenterait d’aller chercher les morceaux ailleurs — et tout s’arrêterait au deuxième segment.

Pour ce projet : **M3U8 = hls.js + proxy**.

---

## MKV

Le MKV pose un problème différent.

Le proxy peut encore aider à **accéder** au fichier (mêmes barrières CORS, SSL, redirections), mais le navigateur, surtout Chrome, **ne décode souvent pas** le conteneur MKV ni certains codecs à l’intérieur (H.265, certaines pistes audio, etc.).

Le proxy ne transforme pas le MKV en un format que Chrome sait lire ; il ne fait que livrer les octets. Si le format ou le codec n’est pas supporté nativement, vous obtiendrez une erreur de décodage même avec le proxy activé.

Pour tester de la VOD IPTV dans le navigateur, **MP4** ou **M3U8** restent les formats réalistes. Le MKV sert surtout à vérifier si l’URL est joignable, pas à garantir une lecture fluide dans la page.

---

## Synthèse

| Format | Rôle principal du proxy |
|--------|-------------------------|
| **MP4** | Contourner CORS, SSL et les redirections pour que le lecteur puisse lire un fichier unique. |
| **M3U8** | Idem, plus réécriture des playlists et relais de tous les segments HLS (sinon la chaîne se casse après la première requête). |
| **MKV** | Peut aider à **récupérer** le fichier ; ne résout pas l’absence de support codec dans le navigateur. |

En une phrase : le proxy n’est pas un luxe pour accélérer le flux — c’est le pont entre les règles du navigateur et la réalité des serveurs IPTV (autres domaines, redirections, playlists découpées). Pour **MP4** et surtout **M3U8** dans ce projet, lancer `npm run proxy` en parallèle de la page web n’est pas optionnel : c’est ce qui permet au lecteur de voir le flux comme s’il venait de chez vous, tout en parlant au vrai serveur côté Node.

---

## Modes proxy dans le lecteur

### Proxy local (`stream-proxy.mjs`, port 3080)

Comportement d’origine : `GET /proxy?url=...`, réécriture m3u8, relais `/hls/...`.

```bash
npm run proxy
```

### Allmovies générique (`allmovies-iptv-proxy`, port 3210)

Même API `/proxy?url=...` exposée par le handler générique (`GENERIC_PROXY_ENABLED=true`). Les segments de secours passent par `/passthrough/hls/*` pour ne pas entrer en conflit avec les routes fournisseur `/hls/{slug}/...`.

```bash
cd ../allmovies-iptv-proxy && docker compose up
```

Dans le lecteur : mode **Allmovies générique (3210)**, base `http://localhost:3210`.

### Allmovies fournisseur (port 3210)

Le lecteur parse l’URL collée et appelle `/proxy/{slug}/movie/...` (ou `/live/`, `/series/`). Allmovies gère la session Redis et réécrit les playlists vers `/hls/{slug}/{sessionKey}/...`.

Prérequis :

1. Fournisseur créé dans l’admin allmovies (`http://localhost:3211`) avec `upstreamBase`, `pathTemplate`, `vodPathTemplate`, `segmentRewrite`
2. Entrée correspondante dans `src/config/providers.js` (mapping hôte → slug)

La découverte CDN côté navigateur est **désactivée** dans ce mode : le proxy allmovies gère déjà les redirections.

---

## Fichiers liés

- `stream-proxy.mjs` — proxy autonome (mode local)
- `../allmovies-iptv-proxy/proxy/lib/handlers/generic-url-handler.js` — passthrough générique pour le mode Allmovies
- `src/config/providers.js` — miroir des fournisseurs admin
- `src/utils/iptvUrlParser.js` — conversion URL IPTV → route fournisseur
- `src/` — application React ; sélecteur de mode proxy et hls.js
- `README.md` — démarrage rapide
