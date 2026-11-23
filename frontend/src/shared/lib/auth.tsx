"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Owner } from "./types";

interface AuthState {
  owner: Owner | null;
  isReady: boolean;
  login: (token: string, owner: Owner) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("tk_token");
    const storedOwner = localStorage.getItem("tk_owner");
    if (storedToken && storedOwner) {
      setOwner(JSON.parse(storedOwner));
    }
    setIsReady(true);
  }, []);

  function login(token: string, newOwner: Owner) {
    localStorage.setItem("tk_token", token);
    localStorage.setItem("tk_owner", JSON.stringify(newOwner));
    setOwner(newOwner);
  }

  function logout() {
    localStorage.removeItem("tk_token");
    localStorage.removeItem("tk_owner");
    setOwner(null);
  }

  return <AuthContext.Provider value={{ owner, isReady, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}