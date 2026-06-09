import { createPortal } from "react-dom";
import { useControlsInsetHost } from "./useControlsInsetHost.js";

/**
 * Insère des enfants React dans la barre de contrôles Video.js.
 */
export function ControlsInset({
  playerSelector,
  beforeSelector,
  name,
  children,
}) {
  const host = useControlsInsetHost({
    playerSelector,
    beforeSelector,
    insetName: name,
  });

  return host ? createPortal(children, host) : null;
}
