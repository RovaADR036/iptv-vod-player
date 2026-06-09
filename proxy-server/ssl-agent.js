import https from "node:https";

let cachedAgent = null;

export function getInsecureAgent() {
  if (!cachedAgent) {
    cachedAgent = new https.Agent({ rejectUnauthorized: false });
  }
  return cachedAgent;
}
