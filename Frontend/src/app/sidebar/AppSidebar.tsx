import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { sidebarMenu } from "./sidebarConfig";

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 h-full bg-card border-r border-border/50 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/40">
        <p className="text-xl font-bold tracking-tight text-foreground">Eye</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mt-0.5">
          Digital Signage
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sidebarMenu.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] px-4 pt-5 pb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path ||
                  (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 h-9 rounded-lg px-3 text-sm transition-colors",
                      active
                        ? "bg-primary/[0.08] text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
