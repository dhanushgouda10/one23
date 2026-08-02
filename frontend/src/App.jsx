import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import JoinRide from "./pages/JoinRide";
import MyRides from "./pages/MyRides";
import GroupLobby from "./pages/GroupLobby";

/**
 * Protected Route Component
 * 
 * This component checks if a JWT token exists in sessionStorage.
 * If no token exists, it redirects to the Login page.
 * If token exists, it renders the child component.
 */
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Suspense fallback={
      <div className="page-loading">
        <div className="page-loading__logo">23</div>
        <div className="page-loading__bar" />
      </div>
    }>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes - require JWT token */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/join"
          element={
            <ProtectedRoute>
              <JoinRide />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join-ride"
          element={
            <ProtectedRoute>
              <JoinRide />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/my-rides" 
          element={
            <ProtectedRoute>
              <MyRides />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/group-lobby/:groupId" 
          element={
            <ProtectedRoute>
              <GroupLobby />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
