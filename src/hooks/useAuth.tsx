"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { User, UserRole } from "@/types";
import {
  getAccessToken,
  isAuthenticated,
  logout as authLogout,
  parseJwt,
  saveAccessToken,
} from "@/utils/authUtils";
import api from "@/utils/api";
import { acessTokens } from "@/dev-data/acessTokens";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      if (!isAuthenticated()) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const token = getAccessToken();

      if (token) {
        const decoded = parseJwt(token);
        if (decoded) {
          // Create user object from token
          const userData: User = {
            id: decoded.id as string,
            email: decoded.email as string,
            first_name: (decoded.first_name as string) || "مستخدم",
            last_name: (decoded.last_name as string) || "",
            role: decoded.role as UserRole,
            created_at:
              (decoded.created_at as string) || new Date().toISOString(),
            updated_at:
              (decoded.updated_at as string) || new Date().toISOString(),
          };
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // const response = await api.post("/api/auth/login", {
      //   email,
      //   password,
      // });

      const response: { data: { accessToken: null | string } } =
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                accessToken: acessTokens[email.split("@")[0]] || null,
              },
            });
          }, 2000);
        });

      if (response.data?.accessToken) {
        // Save token manually since API interceptor might not catch login response
        saveAccessToken(response.data.accessToken);
        await checkAuth(); // Refresh user data
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local auth state, even if API call fails
      authLogout();
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    checkAuth: () => checkAuth(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
