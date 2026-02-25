import { BrowserRouter } from "react-router-dom";
import AppProvider from "@/app/providers/AppProvider";
import AppRoutes from "@/app/routes";

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AppProvider>
);

export default App;
