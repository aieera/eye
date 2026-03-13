import { useLocation, useNavigate } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarMenu } from "./sidebarConfig";
import { Button } from "@/components/ui/button";

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 h-[calc(100vh-80px)] bg-[#F5F5F6] border-r flex flex-col">

      {/* Menu Groups */}
      <div className="px-4 pt-3 space-y-6">

        {sidebarMenu.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-xs font-bold text-black mb-3">
              {group.label}
            </p>

            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                  <Button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 rounded-full px-4 py-2 text-sm",
                      active
                        ? "bg-purple-900 text-white hover:bg-purple-900"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-full",
                        active ? "bg-white/20" : "bg-white"
                      )}
                    >
                      <Icon size={16} />
                    </div>

                    {item.name}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Help Card */}
      <div className="mt-5 p-3">
        <div className="bg-white rounded-xl shadow-sm border p-5 text-center">

          <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-black text-white mb-2">
            <HelpCircle size={16} />
          </div>

          <p className="text-sm font-semibold text-black">
            Help & Support
          </p>

          <p className="text-xs text-gray-500 mb-3">
            Having trouble in CMS?
          </p>

          <Button className="w-full rounded-full bg-purple-900 hover:bg-purple-800 text-white">
            Contact us
          </Button>

        </div>
      </div>

    </aside>
  );
}