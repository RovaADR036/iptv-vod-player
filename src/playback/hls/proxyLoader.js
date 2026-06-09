import Hls from "hls.js";

export function createProxyLoader(fixHlsRequestUrl) {
  const Base = Hls.DefaultConfig?.loader;
  if (!Base) return null;

  return class ProxyLoader extends Base {
    load(context, config, callbacks) {
      context.url = fixHlsRequestUrl(context.url);
      super.load(context, config, callbacks);
    }
  };
}
