import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { logout } from "@/modules/auth/store/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/screens": "Screens",
  "/screens/new": "Screens › Add Screen",
  "/products": "Products",
  "/products/new": "Products › Add Product",
  "/categories": "Categories",
  "/offers": "Offers",
  "/offers/new": "Offers › Create Offer",
  "/playlists": "Playlists",
  "/playlists/new": "Playlists › Builder",
  "/schedules": "Schedules",
  "/ingestion": "Data Sync",
  "/logs": "Logs",
  "/settings": "Settings",
};

function getLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (pathname.startsWith("/screens/")) return "Screens › Edit Screen";
  if (pathname.startsWith("/products/")) return "Products › Edit Product";
  if (pathname.startsWith("/offers/")) return "Offers › Edit Offer";
  if (pathname.startsWith("/playlists/")) return "Playlists › Builder";
  if (pathname.startsWith("/ingestion/")) return "Data Sync";
  return "Eye";
}

export default function AppTopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [dark, setDark] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const toggleDark = () => {
    setDark((d) => !d);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <header className="h-14 bg-card/80 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-6 flex-shrink-0">
      {/* Breadcrumb */}
      <p className="text-sm font-medium text-muted-foreground">
        {getLabel(location.pathname)}
      </p>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name ?? "Admin"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email ?? ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
