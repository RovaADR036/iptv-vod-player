import { useCallback, useState } from "react";

const QUERY_KEY = "url";

function readUrlFromQuery() {
  return new URLSearchParams(window.location.search).get(QUERY_KEY) ?? "";
}

export function useStreamUrlQuery() {
  const [streamUrl, setStreamUrl] = useState(readUrlFromQuery);

  const syncToAddressBar = useCallback((rawUrl) => {
    const trimmed = rawUrl.trim();
    const params = new URLSearchParams(window.location.search);
    if (trimmed) {
      params.set(QUERY_KEY, trimmed);
    } else {
      params.delete(QUERY_KEY);
    }
    const query = params.toString();
    const next = query ? `?${query}` : window.location.pathname;
    window.history.replaceState(null, "", next);
  }, []);

  return { streamUrl, setStreamUrl, syncToAddressBar };
}
