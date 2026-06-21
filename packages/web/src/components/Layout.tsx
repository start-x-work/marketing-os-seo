import { NavLink, Outlet } from "react-router-dom";
import { AiKeySettings } from "./AiKeySettings";

const navItems = [
  { to: "/llmo", label: "LLMO診断" },
  { to: "/site", label: "サイト診断" },
  { to: "/brief", label: "ブリーフ" },
  { to: "/keywords", label: "キーワード" },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eeeeff,transparent_36%),linear-gradient(180deg,#ffffff,#f8fbff)]">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <NavLink
            to="/"
            className="text-lg font-semibold tracking-tight text-slate"
          >
            Marketing-OS SEO
          </NavLink>
          <nav className="flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 transition ${
                    isActive
                      ? "bg-indigo text-white"
                      : "text-slate-muted hover:bg-indigo-light hover:text-indigo"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl space-y-2 px-5 pb-10 text-sm text-slate-muted">
        <p>診断と編集可能な提案に限定し、自動投稿・自動最適化は行いません。</p>
        <p>
          継続運用・チームでの意思決定には{" "}
          <a
            href="https://marketing-os.jp"
            className="font-medium text-indigo hover:underline"
          >
            Marketing-OS
          </a>
        </p>
        <AiKeySettings />
      </footer>
    </div>
  );
}
