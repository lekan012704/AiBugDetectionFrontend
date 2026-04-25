import { createContext, useContext, useState, ReactNode } from "react";
import { authApi, tokenManager, type UserProfile } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("bugdetect_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => tokenManager.getToken());
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res: any = await authApi.login({ email, password });
      const data = res.Data || res;
      const jwt = data.Token || data.token;
      if (!jwt) throw new Error("No token received from server");
      tokenManager.setToken(jwt);
      setToken(jwt);

      const apiUser = data.User || data.user;
      const userProfile: UserProfile = apiUser
        ? {
            id: apiUser.Id || apiUser.id || "",
            email: apiUser.Email || apiUser.email || email,
            firstName: apiUser.FirstName || apiUser.firstName || email.split("@")[0],
            lastName: apiUser.LastName || apiUser.lastName || "",
            phoneNumber: apiUser.PhoneNumber || apiUser.phoneNumber,
          }
        : { id: "", email, firstName: email.split("@")[0], lastName: "" };
      localStorage.setItem("bugdetect_user", JSON.stringify(userProfile));
      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenManager.removeToken();
    localStorage.removeItem("bugdetect_user");
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    await authApi.updateProfile(data);
    const updated = { ...user!, ...data };
    localStorage.setItem("bugdetect_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
