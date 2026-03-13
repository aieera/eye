import { Outlet } from "react-router-dom";
import AppSidebar from "../sidebar/AppSidebar";
import AppTopBar from "../sidebar/AppTopbar";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col">

      {/* Topbar */}
      <AppTopBar />

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">

        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 bg-[#F9F9FB]">
          <Outlet />
        </main>

      </div>

      {/* Global Toast */}
      <Toaster />

    </div>
  );
}