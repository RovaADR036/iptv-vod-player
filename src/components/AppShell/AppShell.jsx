import "./AppShell.css";

export function AppShell({ overlay, children }) {
  return (
    <div className="app-shell">
      <main className="app-shell__main">{children}</main>
      {overlay ? <div className="app-shell__overlay">{overlay}</div> : null}
    </div>
  );
}
