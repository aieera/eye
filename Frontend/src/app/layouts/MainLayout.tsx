import AppSidebar from "@/app/sidebar/AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
  <div className="min-h-screen flex w-full">
    <AppSidebar />
    <main className="flex-1 overflow-auto bg-background">
      {children}
    </main>
  </div>
);

export default MainLayout;
