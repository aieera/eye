import { Provider } from "react-redux";
import { store } from "@/app/store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthInitializer from "@/modules/auth/components/AuthInitializer";
import { SocketProvider } from "@/shared/socket/SocketProvider";

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthInitializer />
      <SocketProvider>{children}</SocketProvider>
    </TooltipProvider>
  </Provider>
);

export default AppProvider;
