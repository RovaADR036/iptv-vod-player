import { useCallback, useState } from "react";
import {
  DEFAULT_PROXY_BASE,
  PROXY_MODE,
  PROXY_MODE_BASE,
} from "../config/defaults.js";
import { DEFAULT_PROVIDER_SLUG } from "../config/providers.js";

export function useProxySettings() {
  const [useProxy, setUseProxy] = useState(true);
  const [proxyMode, setProxyMode] = useState(PROXY_MODE.LOCAL);
  const [proxyBase, setProxyBase] = useState(DEFAULT_PROXY_BASE);
  const [providerSlug, setProviderSlug] = useState(DEFAULT_PROVIDER_SLUG);

  const settings = { useProxy, proxyMode, proxyBase, providerSlug };

  const toggleProxy = useCallback((checked) => {
    setUseProxy(checked);
  }, []);

  const updateProxyBase = useCallback((value) => {
    setProxyBase(value);
  }, []);

  const updateProxyMode = useCallback((mode) => {
    setProxyMode(mode);
    const presetBase = PROXY_MODE_BASE[mode];
    if (presetBase) {
      setProxyBase(presetBase);
    }
  }, []);

  const updateProviderSlug = useCallback((value) => {
    setProviderSlug(value);
  }, []);

  return {
    settings,
    useProxy,
    proxyMode,
    proxyBase,
    providerSlug,
    toggleProxy,
    updateProxyBase,
    updateProxyMode,
    updateProviderSlug,
  };
}
