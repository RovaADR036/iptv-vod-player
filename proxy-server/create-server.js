import http from "node:http";
import { DEFAULT_PORT } from "./constants.js";
import { routeRequest } from "./handlers.js";
import { LocalProxySession } from "./session-state.js";

/**
 * Crée le serveur proxy local (mode 3080).
 * Une session en mémoire par processus — adapté au dev mono-utilisateur.
 */
export function createLocalProxyServer(options = {}) {
  const port = options.port ?? (Number(process.env.STREAM_PROXY_PORT) || DEFAULT_PORT);
  const session = options.session ?? new LocalProxySession();

  const server = http.createServer((req, res) => {
    routeRequest(req, res, session, port);
  });

  return { server, session, port };
}

export function startLocalProxyServer(options = {}) {
  const { server, port } = createLocalProxyServer(options);

  server.listen(port, "127.0.0.1", () => {
    console.log(`Proxy flux (mp4 + m3u8): http://127.0.0.1:${port}/proxy?url=...`);
    console.log("Segments relatifs (/hls/...) relayés via Referer ou dernier CDN connu.");
  });

  return server;
}
