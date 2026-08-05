import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { isAuthenticated, getUserName } from "@/lib/session";

/**
 * Client-side guard for pages that require a logged-in user.
 *
 * The backend is stateless JWT-over-Bearer-header with no cookie, so
 * there's nothing for the server to check during SSR — the token only
 * ever lives in this tab's sessionStorage. Renders nothing and redirects
 * to /login until the client has confirmed a token is present.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      void router.navigate({ to: "/login" });
      return;
    }
    setReady(true);
  }, [router]);

  return { ready, userName: getUserName() };
}
