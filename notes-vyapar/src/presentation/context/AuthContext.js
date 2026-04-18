"use client";

import { createContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const AUTH_TOKEN_KEY = "notes-vyapar.auth-token";

const isBrowser = () => typeof window !== "undefined";

const readStoredToken = () => {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

const storeToken = (token) => {
  if (!isBrowser()) {
    return;
  }

  if (!token) {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const parseResponse = async (response) => {
  let result = {};

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("loading");

  const fetchProfile = async (authToken) => {
    const response = await fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      cache: "no-store"
    });

    const result = await parseResponse(response);
    return result.user;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = readStoredToken();

      if (!storedToken) {
        setStatus("ready");
        return;
      }

      try {
        const currentUser = await fetchProfile(storedToken);
        setToken(storedToken);
        setUser(currentUser);
      } catch {
        storeToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setStatus("ready");
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (credentials) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    });

    const result = await parseResponse(response);

    storeToken(result.token);
    setToken(result.token);
    setUser(result.user);

    return result;
  };

  const signUp = async (payload) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return parseResponse(response);
  };

  const signOut = async () => {
    storeToken(null);
    setToken(null);
    setUser(null);

    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
    } catch {
      // Client state has already been cleared, so logout can remain best-effort.
    }
  };

  const authFetch = async (input, init = {}) => {
    const authToken = token || readStoredToken();
    const headers = new Headers(init.headers || {});

    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    return fetch(input, {
      ...init,
      headers
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        status,
        isAuthenticated: Boolean(user && token),
        signIn,
        signUp,
        signOut,
        authFetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
