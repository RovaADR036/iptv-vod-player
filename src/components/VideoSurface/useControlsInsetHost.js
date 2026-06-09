import { useLayoutEffect, useState } from "react";
import {
  findControlsButtonGroup,
  findOrCreateInsetHost,
} from "./controlsInsetDom.js";

/**
 * Attend que la barre de contrôles Video.js soit montée, puis fournit un nœud hôte.
 */
export function useControlsInsetHost({
  playerSelector,
  beforeSelector,
  insetName,
}) {
  const [host, setHost] = useState(null);

  useLayoutEffect(() => {
    const attach = () => {
      const skin = document.querySelector(playerSelector);
      const group = skin ? findControlsButtonGroup(skin) : null;
      if (!group) return false;

      setHost(findOrCreateInsetHost(group, insetName, beforeSelector));
      return true;
    };

    if (attach()) return undefined;

    const skin = document.querySelector(playerSelector);
    if (!skin) return undefined;

    const observer = new MutationObserver(() => attach());
    observer.observe(skin, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [playerSelector, beforeSelector, insetName]);

  return host;
}
