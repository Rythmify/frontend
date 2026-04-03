import { useLocation, Link } from "react-router-dom";

const NAV_TABS = [
  { label: "Account", path: "/settings" },
  { label: "Content", path: "/settings/content" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "Privacy", path: "/settings/privacy" },
  { label: "Advertising", path: "/settings/advertising" },
  { label: "2FA", path: "/settings/two-factor" },
] as const;

const FOOTER_LINKS = [
  "Legal",
  "Privacy",
  "Cookie Policy",
  "Cookie Manager",
  "Imprint",
  "Artist Resources",
  "Newsroom",
  "Charts",
  "Transparency Reports",
] as const;

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <div className="container px-4 md:px-8 lg:px-20 bg-[var(--color-bg)]">
      {/* ── Settings Title + Tabs ── */}
      <div>
        <div className="container px-6 max-w-[var(--container-max)]">
          <h1 className="text-[var(--color-text-hover)] pt-8 pb-5 text-2xl font-bold">
            Settings
          </h1>

          <nav className="flex">
            {NAV_TABS.map((tab) => {
              const active = isActive(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`
                    relative px-4 pb-3 text-xl font-bold transition-colors duration-150
                    ${
                      active
                        ? " after:absolute after:bottom-0 text-[var(--color-text-hover)] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--color-text-hover)] after:content-['']"
                        : "text-[var(--color-text)] hover:text-[var(--color-text-hover)]"
                    }
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 container px-6 max-w-[var(--container-max)] py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className=" mt-auto">
        <div className="container px-6 max-w-[var(--container-max)] py-6">
          <div className="flex flex-wrap gap-y-1 text-xs text-[var(--color-text)]">
            {FOOTER_LINKS.map((link, index) => (
              <span key={link} className="flex cursor-pointer items-center">
                <span>{link}</span>
                {index < FOOTER_LINKS.length - 1 && (
                  <span className="mx-2 text-[var(--color-text-muted)]">·</span>
                )}
              </span>
            ))}
          </div>
          <div className="mt-3 text-xs text-[var(--color-text-hover)]">
            Language:{" "}
            <span className="text-[var(--color-text-link)] cursor-pointer hover:underline">
              English (US)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
