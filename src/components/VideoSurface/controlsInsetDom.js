const CONTROLS_GROUP_SELECTOR =
  ".media-controls .media-button-group:last-child";

/**
 * @param {ParentNode} skinRoot
 */
export function findControlsButtonGroup(skinRoot) {
  return skinRoot.querySelector(CONTROLS_GROUP_SELECTOR);
}

/**
 * @param {Element} group
 * @param {string} insetName
 * @param {string} beforeSelector
 */
export function findOrCreateInsetHost(group, insetName, beforeSelector) {
  const existing = group.querySelector(`[data-inset="${insetName}"]`);
  if (existing) return existing;

  const host = document.createElement("span");
  host.dataset.inset = insetName;
  host.className = "media-controls-inset";

  const before = group.querySelector(beforeSelector);
  let insertBefore = null;

  if (before) {
    let node = before;
    while (node?.parentElement && node.parentElement !== group) {
      node = node.parentElement;
    }
    if (node?.parentElement === group) insertBefore = node;
  }

  if (insertBefore) group.insertBefore(host, insertBefore);
  else group.appendChild(host);

  return host;
}
