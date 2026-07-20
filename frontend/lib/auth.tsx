"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import api, { User, TokenResponse } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    riskProfile: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("finselor_token");
    const storedUser = localStorage.getItem("finselor_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("finselor_user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = useCallback((data: TokenResponse) => {
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("finselor_token", data.access_token);
    localStorage.setItem("finselor_user", JSON.stringify(data.user));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<TokenResponse>("/auth/login", {
        email,
        password,
      });
      handleAuthResponse(res.data);
    },
    [handleAuthResponse]
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      riskProfile: string
    ) => {
      const res = await api.post<TokenResponse>("/auth/register", {
        full_name: fullName,
        email,
        password,
        risk_profile: riskProfile,
      });
      handleAuthResponse(res.data);
    },
    [handleAuthResponse]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("finselor_token");
    localStorage.removeItem("finselor_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
