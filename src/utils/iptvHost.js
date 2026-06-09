/** Rétrocompatibilité — délègue à proxy/hosts/. */
export {
  isLocalProxyUrl,
  isPassthroughHlsUrl,
  isAllmoviesProviderSegmentUrl,
  isAllmoviesProviderRedirectUrl,
  isLineIptvOrigin,
  localProxyPathToUpstream,
  remapLineSegmentUrl,
} from "../proxy/hosts/index.js";
