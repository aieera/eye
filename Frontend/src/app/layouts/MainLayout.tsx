import { Outlet } from "react-router-dom";
import AppSidebar from "../sidebar/AppSidebar";
import AppTopBar from "../sidebar/AppTopbar";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Topbar */}
      <AppTopBar />

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>

      {/* Global Toast */}
      <Toaster />
    </div>
  );
}
