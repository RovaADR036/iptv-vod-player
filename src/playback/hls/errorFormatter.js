export function formatHlsFatalError(data) {
  const msg = data.details || data.type || "erreur HLS";
  const rawFrag = data.frag?.url || "";
  const frag = rawFrag ? ` Segment : ${rawFrag.slice(0, 140)}…` : "";

  let hint =
    data.details === "fragParsingError"
      ? " (segment invalide ou format non TS)"
      : "";

  if (rawFrag.includes("/hls/") && !rawFrag.includes("/proxy?url=")) {
    hint +=
      " — rechargez la page après docker compose up (correctif CDN en cours)";
  }

  return `Erreur HLS : ${msg}${hint}.${frag}`;
}
