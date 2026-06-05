import { useCallback, useState } from "react";
import { DEFAULT_PROXY_BASE } from "../config/defaults.js";

export function useProxySettings() {
  const [useProxy, setUseProxy] = useState(true);
  const [proxyBase, setProxyBase] = useState(DEFAULT_PROXY_BASE);

  const settings = { useProxy, proxyBase };

  const toggleProxy = useCallback((checked) => {
    setUseProxy(checked);
  }, []);

  const updateProxyBase = useCallback((value) => {
    setProxyBase(value);
  }, []);

  return {
    settings,
    useProxy,
    proxyBase,
    toggleProxy,
    updateProxyBase,
  };
}
