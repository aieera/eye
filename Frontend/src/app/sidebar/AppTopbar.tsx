import { Search, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppTopBar() {
  return (
    <header className="h-20 bg-[#F5F5F6] border-b flex items-center justify-between px-8">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="leading-tight">
          <p className="text-lg font-semibold text-black">Display</p>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            <p className="text-xl font-bold text-black">CMS</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white rounded-full px-5 py-3 w-[520px] shadow-sm border">
        <Search className="h-4 w-4 text-gray-400 mr-3" />

        <input
          type="text"
          placeholder="Search products, playlist..."
          className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">

        {/* Theme Toggle */}
        <div className="flex items-center bg-white rounded-full shadow-sm border p-1">
          <Button size="icon" variant="ghost" className="rounded-full">
            <Moon size={16} />
          </Button>

          <Button size="icon" className="rounded-full bg-purple-900 hover:bg-purple-800 text-white">
            <Sun size={16} />
          </Button>
        </div>

        {/* Notification */}
        <div className="relative">
          <Button size="icon" variant="outline" className="rounded-full bg-white">
            <Bell size={16} />
          </Button>

          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-full shadow-sm border cursor-pointer">

          <img
            src="https://i.pravatar.cc/40"
            alt="user"
            className="w-8 h-8 rounded-full"
          />

          <div className="text-sm leading-tight">
            <p className="font-medium text-black">Admin User</p>
            <p className="text-xs text-gray-500">abc@gmail.com</p>
          </div>

        </div>

      </div>

    </header>
  );
}