export function isLineIptvHost(hostname) {
  return /dndnscloud|xtream|line\./i.test(hostname);
}

export function isStreamEdgeHost(hostname) {
  return isLineIptvHost(hostname);
}

export function isLocalProxyHost(href) {
  try {
    const h = new URL(href).hostname;
    return h === "127.0.0.1" || h === "localhost";
  } catch {
    return false;
  }
}
