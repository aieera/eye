import { Provider } from "react-redux";
import { store } from "@/app/store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthInitializer from "@/modules/auth/components/AuthInitializer";

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthInitializer />
      {children}
    </TooltipProvider>
  </Provider>
);

export default AppProvider;
