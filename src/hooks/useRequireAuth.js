import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getUserName } from "../lib/session";

export function useRequireAuth() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setReady(true);
  }, [navigate]);

  return { ready, userName: getUserName() };
}
