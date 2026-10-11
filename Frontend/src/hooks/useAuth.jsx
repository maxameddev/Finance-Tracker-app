import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, auth } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (auth.getToken() ? auth.getUser() : null));

  useEffect(() => {
    // Fired by the API client when the token is rejected (401).
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login(email, password);
    auth.save(token, user);
    setUser(user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token, user } = await api.register(name, email, password);
    auth.save(token, user);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    auth.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((changes) => {
    setUser((prev) => {
      const next = { ...prev, ...changes };
      auth.save(auth.getToken(), next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
