import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Panneau ouvrable/fermable avec fermeture au clic extérieur et Échap.
 */
export function useDismissiblePanel(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const rootRef = useRef(null);

  const openPanel = useCallback(() => setOpen(true), []);
  const closePanel = useCallback(() => setOpen(false), []);
  const togglePanel = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) closePanel();
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") closePanel();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closePanel]);

  return {
    open,
    rootRef,
    openPanel,
    closePanel,
    togglePanel,
  };
}
