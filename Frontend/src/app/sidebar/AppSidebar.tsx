import { useLocation, useNavigate } from "react-router-dom";
import { Eye, ChevronDown, Package, LogOut, LayoutDashboard, ShoppingCart, Truck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { logout } from "@/modules/auth/store/authSlice";
import { clearTokens } from "@/shared/utils/cookies";
import { getSidebarItems } from "./sidebarConfig";
import type { SidebarItem } from "@/shared/types/sidebar";

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="h-4 w-4" />,
  Sales: <ShoppingCart className="h-4 w-4" />,
  Purchase: <Truck className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const items = getSidebarItems();

  const handleLogout = () => {
    clearTokens();
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <div className="w-60 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
       
        <span className="font-bold text-lg text-sidebar-foreground">Eye</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => (
          <SidebarGroup key={item.title} item={item} currentPath={location.pathname} navigate={navigate} />
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
};

const SidebarGroup = ({ item, currentPath, navigate }: { item: SidebarItem; currentPath: string; navigate: any }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === currentPath;
  const isChildActive = item.children?.some((c) => currentPath.startsWith(c.path || ""));

  if (!hasChildren && item.path) {
    return (
      <button
        onClick={() => navigate(item.path)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
        )}
      >
        {iconMap[item.title]}
        <span>{item.title}</span>
      </button>
    );
  }

  return (
    <Collapsible defaultOpen={isChildActive}>
      <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          {iconMap[item.title]}
          <span>{item.title}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 transition-transform [[data-state=open]>&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-4 space-y-0.5 mt-0.5">
        {item.children?.map((child) => (
          <button
            key={child.path}
            onClick={() => navigate(child.path)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
              currentPath === child.path
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <span>{child.title}</span>
          </button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AppSidebar;
