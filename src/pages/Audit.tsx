import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Package } from "lucide-react";

export default function Audit() {
  const [userFilter, setUserFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const activities = [
    {
      user: "Dr. María García",
      module: "Reservas",
      action: "Solicitud de reserva aprobada",
      timestamp: "2024-03-15 09:30:15",
      type: "success",
    },
    {
      user: "Carlos Mendoza",
      module: "Inventario",
      action: "Equipo marcado en mantenimiento",
      timestamp: "2024-03-15 08:45:22",
      type: "warning",
    },
    {
      user: "Admin Sistema",
      module: "Configuración",
      action: "Configuración de parámetros globales",
      timestamp: "2024-03-14 17:15:33",
      type: "info",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Auditoría del Sistema
        </h1>
        <p className="text-muted-foreground">
          Registro completo de actividades y cambios en el sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Auditoría</CardTitle>
          <CardDescription>Filtra las actividades por usuario y módulo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Usuario</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="teacher">Docentes</SelectItem>
                  <SelectItem value="student">Estudiantes</SelectItem>
                  <SelectItem value="technician">Técnicos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Módulo</label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los módulos</SelectItem>
                  <SelectItem value="reservations">Reservas</SelectItem>
                  <SelectItem value="inventory">Inventario</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="config">Configuración</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividades Recientes</CardTitle>
          <CardDescription>Registro cronológico de acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Fecha y Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{activity.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.module}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {activity.action}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {activity.timestamp}
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
