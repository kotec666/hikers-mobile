import { RouterProvider } from "react-router-dom";
import { router } from "./consts/router";
import { AppProvider } from "@/context/AppContext.tsx";

function AppComponent() {
  return (
    <div className="inter bg-white">
      <AppProvider>
        <RouterProvider router={router} key={window.location.pathname} />
      </AppProvider>
    </div>
  );
}

export default AppComponent;
