import { RouterProvider } from "react-router-dom";
import { router } from "./consts/router";

function AppComponent() {
  return (
    <div className="inter bg-white">
      <RouterProvider router={router} key={window.location.pathname} />
    </div>
  );
}

export default AppComponent;
