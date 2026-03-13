import { BrowserRouter } from "react-router-dom";
import AppProvider from "@/app/providers/AppProvider";
import AppRoutes from "@/app/routes";
import { Toaster } from "./components/ui/toaster";

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <AppRoutes />
      <Toaster/>
    </BrowserRouter>
  </AppProvider>
);

export default App;
