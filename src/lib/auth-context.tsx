import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiClient, endpoints } from "@/lib/api-client";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  phone?: string;
}

interface StudentProfile {
  _id: string;
  user: User;
  rollNumber: string;
  className: string;
  stream: string;
  section?: string;
  guardianName?: string;
  enrolledCourseIds: string[];
}

interface AuthContextType {
  user: User | null;
  student: StudentProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setStudent(null);
        return;
      }
      const data = await apiClient.get<{ user: User; student: StudentProfile }>(endpoints.auth.me);
      setUser(data.user);
      setStudent(data.student);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      setStudent(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await apiClient.auth.post<{ user: User; token: string }>(endpoints.auth.login, { email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    await refreshUser();
    return data.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiClient.auth.post<{ user: User; token: string }>(endpoints.auth.register, { name, email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    await refreshUser();
    return data.user;
  };

  const logout = async () => {
    try {
      await apiClient.post(endpoints.auth.logout);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setStudent(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refreshUser,
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
