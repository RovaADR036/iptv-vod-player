let active = false;
let originalOpen = null;

export function enableHlsXhrPatch(fixUrl) {
  if (active) return;
  originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (typeof url === "string") {
      url = fixUrl(url);
    }
    return originalOpen.call(this, method, url, ...rest);
  };
  active = true;
}

export function disableHlsXhrPatch() {
  if (!active || !originalOpen) return;
  XMLHttpRequest.prototype.open = originalOpen;
  active = false;
  originalOpen = null;
}
