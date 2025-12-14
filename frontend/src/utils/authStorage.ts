const LS = "lockin_token";
const SS = "lockin_token_session";

export function getToken(): string | null {
  return localStorage.getItem(LS) || sessionStorage.getItem(SS);
}

export function setToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(LS, token);
    sessionStorage.removeItem(SS);
  } else {
    sessionStorage.setItem(SS, token);
    localStorage.removeItem(LS);
  }
}

export function clearToken() {
  localStorage.removeItem(LS);
  sessionStorage.removeItem(SS);
}
