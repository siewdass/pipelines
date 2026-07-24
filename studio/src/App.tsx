import { useRoutes, Navigate } from "react-router";
import { useEffect } from "react";
import { Toaster } from "./hooks/useToast";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import Projects from "./pages/Projects";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { useAuthStore } from "./state/auth";
import { NavigateSetter } from "./hooks/useRouter";
import Landing from "./pages/Landing";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useTheme();

  const routes = useRoutes([
    {
      path: "/",
      element: <Landing />,
    },
    {
      element: isAuthenticated ? <AppLayout /> : <Navigate to="/signin" />,
      children: [
        { path: "/dashboard", element: <Home /> },
        { path: "/profile", element: <UserProfiles /> },
        { path: "/blank", element: <Blank /> },
        { path: "/projects/*", element: <Projects /> },
        { path: "/basic-tables", element: <BasicTables /> },
        { path: "/alerts", element: <Alerts /> },
        { path: "/avatars", element: <Avatars /> },
        { path: "/badge", element: <Badges /> },
        { path: "/buttons", element: <Buttons /> },
        { path: "/images", element: <Images /> },
        { path: "/videos", element: <Videos /> },
        { path: "/line-chart", element: <LineChart /> },
        { path: "/bar-chart", element: <BarChart /> },
      ],
    },
    {
      path: "/signin",
      element: isAuthenticated ? <Navigate to="/projects" /> : <SignIn />,
    },
    {
      path: "/signup",
      element: isAuthenticated ? <Navigate to="/projects" /> : <SignUp />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  // Smoothly fade out and remove the preloader when the app mounts
  useEffect(() => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = "0";
        preloader.style.visibility = "hidden";
        setTimeout(() => preloader.remove(), 500); // 500ms for transition
      }, 300); // Optional small hardcode delay so it doesn't flash infinitely fast
    }
  }, []);

  return (  
    <>
      <Toaster
        position="top-center"
        theme={theme}
        toastOptions={{
          className: '!bg-white !text-gray-700 !border !border-gray-200 dark:!bg-gray-900 dark:!text-gray-300 dark:!border-gray-700',
        }}
      />
      <NavigateSetter />
      <ScrollToTop />
      {routes}
    </>
  );
}
