import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserCog, Edit, TrendingUp, Users as UsersIcon, Activity } from "lucide-react";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");

  const metrics = [
    { title: "Reservas Totales", value: "847", icon: Activity },
    { title: "Mantenimientos Activos", value: "12", icon: Activity },
    { title: "Usuarios Activos", value: "234", icon: UsersIcon },
    { title: "Utilización Global", value: "78%", icon: TrendingUp },
  ];

  const users = [
    {
      name: "Dr. María García",
      role: "docente",
      status: "activo",
      email: "mgarcia@tec.cr",
      lastAccess: "2024-03-15 09:30",
    },
    {
      name: "Carlos Mendoza",
      role: "técnico",
      status: "activo",
      email: "cmendoza@tec.cr",
      lastAccess: "2024-03-15 08:45",
    },
    {
      name: "Ana López",
      role: "estudiante",
      status: "activo",
      email: "alopez@estudiantes.tec.cr",
      lastAccess: "2024-03-14 16:20",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Usuarios y Roles</h1>
        <p className="text-muted-foreground">Administración completa de usuarios del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>Gestiona permisos y roles de los usuarios</CardDescription>
            </div>
            <Button>
              <UsersIcon className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Último acceso: {user.lastAccess}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <UserCog className="mr-2 h-4 w-4" />
                        Modificar Permisos
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
