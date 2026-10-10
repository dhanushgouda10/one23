// Login data is kept in sessionStorage (cleared when the browser tab is closed).
const TOKEN_KEY = "token";
const NAME_KEY = "userName";
const EMAIL_KEY = "userEmail";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUserName() {
  return sessionStorage.getItem(NAME_KEY);
}

export function getUserEmail() {
  return sessionStorage.getItem(EMAIL_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function setSession(session) {
  sessionStorage.setItem(TOKEN_KEY, session.token);
  sessionStorage.setItem(NAME_KEY, session.fullName);
  sessionStorage.setItem(EMAIL_KEY, session.email);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(NAME_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
}
