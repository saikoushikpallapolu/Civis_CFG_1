import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("civis_user");
    const storedToken = localStorage.getItem("civis_access_token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);
      } catch (e) {
        localStorage.removeItem("civis_user");
        localStorage.removeItem("civis_access_token");
        localStorage.removeItem("civis_refresh_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { user: loggedInUser, accessToken: token, refreshToken } = res.data;

    setUser(loggedInUser);
    setAccessToken(token);

    localStorage.setItem("civis_user", JSON.stringify(loggedInUser));
    localStorage.setItem("civis_access_token", token);
    if (refreshToken) {
      localStorage.setItem("civis_refresh_token", refreshToken);
    }

    return loggedInUser;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { user: registeredUser, accessToken: token, refreshToken } = res.data;

    setUser(registeredUser);
    setAccessToken(token);

    localStorage.setItem("civis_user", JSON.stringify(registeredUser));
    localStorage.setItem("civis_access_token", token);
    if (refreshToken) {
      localStorage.setItem("civis_refresh_token", refreshToken);
    }

    return registeredUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("civis_user");
      localStorage.removeItem("civis_access_token");
      localStorage.removeItem("civis_refresh_token");
    }
  };

  const isAdmin = user?.role === "admin";
  const isCitizen = user?.role === "citizen";

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAdmin,
        isCitizen,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
