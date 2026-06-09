import zlib from "node:zlib";
import { CORS_EXPOSE_HEADERS } from "./constants.js";

export function decompressBody(buf, encoding) {
  if (encoding === "gzip") return zlib.gunzipSync(buf);
  if (encoding === "deflate") return zlib.inflateSync(buf);
  if (encoding === "br") return zlib.brotliDecompressSync(buf);
  return buf;
}

export function getProxyOrigin(req, port) {
  const host = req.headers.host || `127.0.0.1:${port}`;
  return `http://${host}`;
}

export function buildCorsHeaders(upstreamHeaders = {}) {
  const out = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": CORS_EXPOSE_HEADERS,
  };
  for (const key of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
  ]) {
    if (upstreamHeaders[key]) out[key] = upstreamHeaders[key];
  }
  return out;
}

export function handlePreflight(req, res) {
  if (req.method !== "OPTIONS") return false;
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.writeHead(204);
  res.end();
  return true;
}
