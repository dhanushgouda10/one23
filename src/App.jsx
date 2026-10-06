import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/Toaster";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JoinPage } from "./pages/JoinPage";
import { MyRidesPage } from "./pages/MyRidesPage";
import { GroupLobbyPage } from "./pages/GroupLobbyPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/rides" element={<MyRidesPage />} />
        <Route path="/rides/:groupId" element={<GroupLobbyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}
