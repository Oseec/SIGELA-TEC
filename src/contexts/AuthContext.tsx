// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { toast } from "@/components/ui/sonner";

export type UserRole = "student" | "teacher" | "technician" | "lab_admin" | "system_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  carnet?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, selectedRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) cargarPerfil(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) cargarPerfil(session);
      else {
        setUser(null);
        setPendingRole(null);
        localStorage.removeItem("sigla_user");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // NUEVO: Validación en useEffect cuando user cambia
  useEffect(() => {
    if (user && pendingRole) {
      console.log("VALIDANDO ROL → Real:", user.role, "Seleccionado:", pendingRole);
      if (user.role !== pendingRole) {
        toast.error("El tipo de usuario seleccionado no coincide con tu rol real");
        logout();
      } else {
        console.log("ROL COINCIDE → REDIRECCIONANDO");
        toast.success(`¡Bienvenido ${user.name}!`);
        setTimeout(() => {
          if (user.role === "student" || user.role === "teacher") {
            navigate("/student-dashboard", { replace: true });
          } else if (user.role === "technician") {
            navigate("/technician-dashboard", { replace: true });
          } else if (user.role === "lab_admin") {
            navigate("/lab-detail", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 800);
      }
      setPendingRole(null);
    }
  }, [user, pendingRole]);

  const cargarPerfil = async (session: Session) => {
    console.log("CARGANDO PERFIL PARA:", session.user.email);

    const { data, error } = await supabase
      .from('perfil_usuario')
      .select('id, nombre_completo, rol, carnet_o_codigo')
      .eq('id', session.user.id)
      .single();

    if (error || !data) {
      toast.error("No tienes perfil asignado");
      await supabase.auth.signOut();
      return;
    }

    console.log("DATOS DE DB:", data);

    const roleMap: Record<string, UserRole> = {
      estudiante: "student",
      docente: "teacher",
      tecnico: "technician",
      admin: "system_admin",
      lab_admin: "lab_admin"
    };

    const realRole = roleMap[data.rol] || "student";
    console.log("ROL EN DB:", data.rol, "→ MAPEADO A:", realRole);

    const appUser: User = {
      id: data.id,
      name: data.nombre_completo,
      email: session.user.email!,
      role: realRole,
      carnet: data.carnet_o_codigo,
    };

    setUser(appUser);
    localStorage.setItem("sigla_user", JSON.stringify(appUser));
  };

  const login = async (email: string, password: string, selectedRole: UserRole) => {
    console.log("INTENTO DE LOGIN → Email:", email, "Rol seleccionado:", selectedRole);

    const dominiosValidos = ["@estudiantec.cr", "@itcr.ac.cr", "@tec.ac.cr"];
    const emailLower = email.toLowerCase().trim();

    if (!dominiosValidos.some(d => emailLower.endsWith(d))) {
      toast.error("Solo correos institucionales del TEC");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLower,
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setPendingRole(selectedRole);
    toast.success("Autenticado, verificando rol...");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPendingRole(null);
    localStorage.removeItem("sigla_user");
    toast.success("Sesión cerrada");
    navigate("/auth", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};