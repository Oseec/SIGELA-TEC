// src/pages/Auth.tsx
import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Users, Wrench, Building2, Shield } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !role) {
      return;
    }

    setIsLoading(true);
    console.log("ROL SELECCIONADO:", role);
    try {
      await login(email, password, role);
      
    } catch (error) {
      // Solo errores críticos
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: "student" as UserRole, label: "Estudiante", icon: GraduationCap, description: "Acceso a reservas y consultas" },
    { value: "teacher" as UserRole, label: "Docente", icon: Users, description: "Gestión de clases y recursos" },
    { value: "technician" as UserRole, label: "Técnico", icon: Wrench, description: "Mantenimiento e inventario" },
    { value: "lab_admin" as UserRole, label: "Administrador de Laboratorio", icon: Building2, description: "Gestión completa del laboratorio" },
    { value: "system_admin" as UserRole, label: "Administrador del Sistema", icon: Shield, description: "Acceso completo al sistema" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">SIGELA</CardTitle>
          <CardDescription>
            Sistema Integral de Gestión de Laboratorios Académicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Usuario</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccione su rol" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@estudiantec.cr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Iniciar Sesión"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">Usuarios de prueba:</p>
              <p className="text-xs">juan.perez@estudiantec.cr → 123456 → Estudiante</p>
              <p className="text-xs">carlos.rodriguez@itcr.ac.cr → 123456 → Técnico</p>
              <p className="text-xs">ana.jimenez@tec.ac.cr → 123456 → Admin</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}