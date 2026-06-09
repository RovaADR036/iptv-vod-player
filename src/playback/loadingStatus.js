import { STATUS } from "../constants/messages.js";

export function getLoadingStatus(isHls, viaProxy) {
  if (isHls) return viaProxy ? STATUS.loadingHlsProxy : STATUS.loadingHls;
  return viaProxy ? STATUS.loadingProxy : STATUS.loadingDirect;
}
