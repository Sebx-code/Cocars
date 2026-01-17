import { ReactNode, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Menu } from "lucide-react";

export type DashboardNavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Props = {
  brandHref?: string;
  brandLabel?: string;
  brandMark?: ReactNode;
  topRight?: ReactNode;
  sidebarFooter?: ReactNode;
  nav: DashboardNavItem[];
  children: ReactNode;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function DashboardShell({
  brandHref = "/",
  brandLabel = "Rideshare",
  brandMark,
  topRight,
  sidebarFooter,
  nav,
  children,
}: Props) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const Sidebar = (
    <aside className="h-full w-72 bg-theme-primary border-r border-theme">
      <div className="h-20 px-6 flex items-center justify-between border-b border-theme">
        <Link to={brandHref} className="flex items-center gap-2">
          {brandMark ?? (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold">
              R
            </span>
          )}
          <span className="font-extrabold tracking-tight text-theme-primary">
            {brandLabel}
          </span>
        </Link>
        <button
          className="lg:hidden p-2 rounded-xl hover:bg-theme-secondary"
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5 text-theme-secondary" />
        </button>
      </div>

      <nav className="p-4 space-y-1">
        {nav.map((item) => {
          const isActive = activePath === item.to || activePath.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cx(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all",
                isActive
                  ? "bg-emerald-600 text-white shadow-theme-md"
                  : "text-theme-secondary hover:bg-theme-secondary"
              )}
            >
              <Icon className={cx("w-5 h-5", isActive ? "text-white" : "text-theme-tertiary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-theme space-y-3">
        {sidebarFooter ?? (
          <div className="rounded-2xl bg-theme-secondary p-4">
            <p className="text-sm font-bold text-theme-primary">Astuce</p>
            <p className="text-sm text-theme-tertiary mt-1">
              Gardez vos informations à jour pour inspirer confiance.
            </p>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-theme-secondary">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-label="Fermer"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (desktop) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
        {Sidebar}
      </div>

      {/* Sidebar (mobile drawer) */}
      <div
        className={cx(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {Sidebar}
      </div>

      {/* Main */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 bg-theme-primary/90 backdrop-blur border-b border-theme">
          <div className="h-20 px-4 sm:px-6 flex items-center justify-between">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-theme-secondary"
              aria-label="Ouvrir le menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6 text-theme-secondary" />
            </button>
            <div className="flex-1" />
            {topRight}
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
