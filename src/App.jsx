import { Routes, Route } from "react-router-dom";
import { Toaster } from "./components/Toaster";
import { RequireAuth } from "./components/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JoinPage } from "./pages/JoinPage";
import { MyRidesPage } from "./pages/MyRidesPage";
import { GroupLobbyPage } from "./pages/GroupLobbyPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// All pages of the app. Pages inside <RequireAuth> need the user to be logged in.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/join"
          element={
            <RequireAuth>
              <JoinPage />
            </RequireAuth>
          }
        />
        <Route
          path="/rides"
          element={
            <RequireAuth>
              <MyRidesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/rides/:groupId"
          element={
            <RequireAuth>
              <GroupLobbyPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}
