/**
 * Client-side auth session.
 *
 * Backed by sessionStorage (not localStorage) so each browser tab keeps
 * its own logged-in user — the backend issues a stateless JWT with no
 * server-side session, so the token is the only thing that matters here.
 * All reads/writes are guarded for SSR, where `window` isn't defined.
 */

const TOKEN_KEY = "token";
const NAME_KEY = "userName";
const EMAIL_KEY = "userEmail";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!hasWindow()) return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUserName(): string | null {
  if (!hasWindow()) return null;
  return sessionStorage.getItem(NAME_KEY);
}

export function getUserEmail(): string | null {
  if (!hasWindow()) return null;
  return sessionStorage.getItem(EMAIL_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function setSession(session: { token: string; fullName: string; email: string }): void {
  if (!hasWindow()) return;
  sessionStorage.setItem(TOKEN_KEY, session.token);
  sessionStorage.setItem(NAME_KEY, session.fullName);
  sessionStorage.setItem(EMAIL_KEY, session.email);
}

export function clearSession(): void {
  if (!hasWindow()) return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(NAME_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
}
