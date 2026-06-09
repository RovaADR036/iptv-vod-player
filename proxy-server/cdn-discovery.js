import http from "node:http";
import https from "node:https";
import { UPSTREAM_HEADERS } from "./constants.js";
import { getInsecureAgent } from "./ssl-agent.js";

export function discoverCdnFromRedirects(startUrl, session, done) {
  if (session.sessionCdnOrigin) {
    done();
    return;
  }

  const visit = (url, depth) => {
    if (depth > 15) {
      done();
      return;
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      done();
      return;
    }

    const lib = parsed.protocol === "https:" ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: UPSTREAM_HEADERS,
      agent: parsed.protocol === "https:" ? getInsecureAgent() : undefined,
    };

    const req = lib.request(opts, (res) => {
      const status = res.statusCode || 0;
      const location = res.headers.location;

      if ([301, 302, 303, 307, 308].includes(status) && location) {
        const next = new URL(location, url).href;
        session.noteCdnRedirect(url, next);
        res.resume();
        visit(next, depth + 1);
        return;
      }

      res.resume();
      session.adoptCdnOrigin(parsed.origin);
      done();
    });

    req.on("error", () => done());
    req.end();
  };

  visit(startUrl, 0);
}
