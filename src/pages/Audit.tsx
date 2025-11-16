import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Package } from "lucide-react";
import { useBitacora } from "@/hooks/useBitacora";

export default function Audit() {
  const [userFilter, setUserFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const { data: activities, isLoading } = useBitacora({ userFilter, moduleFilter });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Auditoría del Sistema
        </h1>
        <p className="text-muted-foreground">
          Registro completo de actividades y cambios en el sistema
        </p>
      </div>

      {/* === FILTROS === */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Auditoría</CardTitle>
          <CardDescription>Filtra las actividades por usuario y módulo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            
            {/* Filtro usuario */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Usuario</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="docente">Docentes</SelectItem>
                  <SelectItem value="estudiante">Estudiantes</SelectItem>
                  <SelectItem value="tecnico">Técnicos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro módulo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Módulo</label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="solicitud">Reservas</SelectItem>
                  <SelectItem value="recurso">Inventario</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="parametro">Configuración</SelectItem>
                  <SelectItem value="laboratorio">Laboratorios</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* === TABLA === */}
      <Card>
        <CardHeader>
          <CardTitle>Actividades Recientes</CardTitle>
          <CardDescription>Registro cronológico de acciones</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando auditoría...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities?.map((a) => (
                  <TableRow key={a.id}>
                    
                    {/* Usuario */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {a.perfil_usuario?.nombre_completo ?? "Usuario desconocido"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Módulo */}
                    <TableCell>
                      <Badge variant="outline">{a.tabla_afectada}</Badge>
                    </TableCell>

                    {/* Acción */}
                    <TableCell className="max-w-md">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {a.accion}
                      </div>
                    </TableCell>

                    {/* Detalles */}
                    <TableCell className="text-sm text-muted-foreground">
                      {a.detalles ? JSON.stringify(a.detalles) : "-"}
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.fecha_hora).toLocaleString("es-CR")}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
