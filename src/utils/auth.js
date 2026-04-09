const API_BASE = "http://localhost:5555/api/v1/auth";

export const saveAuth = (token, user) => {
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
};

export const clearAuth = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  window.dispatchEvent(new Event("auth-changed"));
};

export const getAuthUser = () => {
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => Boolean(localStorage.getItem("authToken"));

export const registerRequest = async (payload) => {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Registration failed");
  }
  return data;
};

export const loginRequest = async (payload) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Login failed");
  }
  return data;
};

export const logoutRequest = async () => {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Logout failed");
  }
  return data;
};
