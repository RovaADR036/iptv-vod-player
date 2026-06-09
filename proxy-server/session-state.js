import { isStreamEdgeHost } from "./hosts.js";

export class LocalProxySession {
  constructor() {
    this.lastUpstreamOrigin = null;
    this.sessionCdnOrigin = null;
    this.sessionEntryM3u8 = null;
  }

  adoptCdnOrigin(origin) {
    if (!origin || isStreamEdgeHost(new URL(origin).hostname)) return;
    this.sessionCdnOrigin = origin;
    this.lastUpstreamOrigin = origin;
  }

  noteCdnRedirect(fromUrl, toUrl) {
    try {
      const from = new URL(fromUrl);
      const to = new URL(toUrl);
      if (from.origin === to.origin) return;
      if (!isStreamEdgeHost(to.hostname)) {
        this.adoptCdnOrigin(to.origin);
      }
    } catch {
      /* ignore */
    }
  }

  recordUpstreamOrigin(origin) {
    this.lastUpstreamOrigin = origin;
  }

  setEntryM3u8(url) {
    this.sessionEntryM3u8 = url;
  }
}
