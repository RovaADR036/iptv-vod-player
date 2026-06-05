import { useCallback, useEffect, useState } from "react";

const QUERY_KEY = "url";

export function useStreamUrlQuery() {
  const [streamUrl, setStreamUrl] = useState(() => {
    return new URLSearchParams(window.location.search).get(QUERY_KEY) ?? "";
  });

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

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get(QUERY_KEY);
    if (fromQuery) setStreamUrl(fromQuery);
  }, []);

  return { streamUrl, setStreamUrl, syncToAddressBar };
}
