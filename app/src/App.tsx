import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
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
import { NavigateSetter } from "./services/api";
import Landing from "./pages/Landing";

export default function App() {
  const { isAuthenticated } = useAuthStore();

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
      <Toaster richColors position="top-right" />
      <Router>
        <NavigateSetter />
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />

          {/* Dashboard Layout - Protected */}
          <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/signin" />}>
            <Route path="/dashboard" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />

            {/* Projects */}
            <Route path="/projects/*" element={<Projects />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout - Redirect if already logged in */}
          <Route path="/signin" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
