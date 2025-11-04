import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type UserRole = "student" | "teacher" | "technician" | "lab_admin" | "system_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  carnet?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const storedUser = localStorage.getItem("sigla_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulación de login - en producción esto haría una llamada al backend
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === "student" ? "Juan Pérez" : 
            role === "teacher" ? "Dr. María González" :
            role === "technician" ? "Carlos Rodríguez" :
            role === "lab_admin" ? "Ana Jiménez" :
            "Admin Sistema",
      email,
      role,
      department: role === "student" ? "Computación" : 
                  role === "teacher" ? "Escuela de Computación" :
                  role === "technician" ? "Laboratorio de Física" :
                  role === "lab_admin" ? "Laboratorio de Computación" :
                  "Administración",
      carnet: role === "student" ? "2021123456" : undefined,
    };

    setUser(mockUser);
    localStorage.setItem("sigla_user", JSON.stringify(mockUser));
    
    // Redirigir según el rol
    if (role === "student" || role === "teacher") {
      navigate("/student-dashboard");
    } else if (role === "technician") {
      navigate("/technician-dashboard");
    } else if (role === "lab_admin") {
      navigate("/lab-detail");
    } else {
      navigate("/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sigla_user");
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
