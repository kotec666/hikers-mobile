import { createBrowserRouter } from "react-router-dom";
import WelcomePage from "../pages/welcome-page";
import Load from "../pages/load";
import Auth from "../pages/auth";
import { AuthEnum } from "@/pages/auth/types/enum.ts";
import ProfilePage from "@/pages/profile";
import MapPage from "@/pages/map";
import MainLayout from "@/components/layouts/MainLayout";
import UserData from "@/pages/profile/userData";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/load",
    element: <Load loading={true} />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/map",
    element: <MapPage />,
  },
  {
    path: "/reg",
    element: <Auth variant={AuthEnum.REG} />,
  },
  {
    path: "/profile/userdata",
    element: <UserData />,
  },
  {
    path: "/featured",
    element: <MainLayout>featured</MainLayout>,
  },
  {
    path: "/history",
    element: <MainLayout>history</MainLayout>,
  },
]);
