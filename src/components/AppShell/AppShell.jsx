import "./AppShell.css";

export function AppShell({ header, status, children }) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">{header}</header>
      {status}
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
