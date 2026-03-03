import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarNavItem } from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
  brand: { title: string; subtitle: string };
  nav: SidebarNavItem[];
};

export default function AppShell({ brand, nav }: Props) {
  return (
    <div className="min-h-screen bg-vp-bg text-vp-text">
      <div className="flex min-h-screen w-full">
        {/* Sidebar (desktop) */}
        <Sidebar brand={brand} nav={nav} />

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          {/* Main: padding fluido por breakpoint */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
            {/* Contenedor: full width, pero con ancho cómodo en pantallas grandes */}
            <div className="mx-auto w-full max-w-[1200px]">
              <div className="rounded-2xl border border-vp-border bg-vp-panel shadow-vp">
                <div className="p-4 sm:p-6">
                  <Outlet />
                </div>
              </div>
            </div>
          </main>

          <footer className="px-4 pb-6 text-xs text-vp-muted sm:px-6 lg:px-10">
            Virtual Planet • UI Mock v0.2 (multi-tenant)
          </footer>
        </div>
      </div>
    </div>
  );
}