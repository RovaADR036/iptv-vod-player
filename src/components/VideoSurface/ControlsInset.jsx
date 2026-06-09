import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Insère un composant dans la barre de contrôles Video.js (groupe de boutons droit).
 */
export function ControlsInset({ playerSelector, beforeSelector, name, children }) {
  const [host, setHost] = useState(null);

  useLayoutEffect(() => {
    const tryAttach = () => {
      const skin = document.querySelector(playerSelector);
      const group = skin?.querySelector(
        ".media-controls .media-button-group:last-child"
      );
      if (!group) return false;

      let el = group.querySelector(`[data-inset="${name}"]`);
      if (!el) {
        el = document.createElement("span");
        el.dataset.inset = name;
        el.className = "media-controls-inset";

        const before = group.querySelector(beforeSelector);
        let insertBefore = null;
        if (before) {
          let node = before;
          while (node?.parentElement && node.parentElement !== group) {
            node = node.parentElement;
          }
          if (node?.parentElement === group) insertBefore = node;
        }

        if (insertBefore) group.insertBefore(el, insertBefore);
        else group.appendChild(el);
      }

      setHost(el);
      return true;
    };

    if (tryAttach()) return undefined;

    const skin = document.querySelector(playerSelector);
    if (!skin) return undefined;

    const observer = new MutationObserver(() => tryAttach());
    observer.observe(skin, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [playerSelector, beforeSelector, name]);

  return host ? createPortal(children, host) : null;
}
