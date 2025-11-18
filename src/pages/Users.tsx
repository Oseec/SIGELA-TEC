import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserCog, Edit, TrendingUp, Users as UsersIcon, Activity } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useUserMetrics } from "@/hooks/useUserMetrics";
import { supabase } from "@/lib/supabaseClient";

import { AddUserModal } from "@/components/AddUserModal";
import { EditUserModal } from "@/components/EditUserModal";
import { Switch } from "@/components/ui/switch";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userAdmin, setUserAdmin] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserAdmin(data.user);
    };
    loadUser();
  }, []);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: metricsData } = useUserMetrics();
  const metrics = [
    { title: "Reservas Totales", value: metricsData?.totalReservas ?? "—", icon: Activity },
    { title: "Mantenimientos Activos", value: metricsData?.mantenimientosActivos ?? "—", icon: Activity },
    { title: "Usuarios Activos", value: metricsData?.usuariosActivos ?? "—", icon: UsersIcon },
    { title: "Utilización Global", value: metricsData?.utilizacion + "%", icon: TrendingUp },
  ];

  const { data: users, isLoading, refetch } = useUsers(searchTerm);

  const activateUser = async (id) => {
    await supabase.from("perfil_usuario")
      .update({ estado: "activo" })
      .eq("id", id);
  }

  const deactivateUser = async (id) => {
    await supabase.from("perfil_usuario")
      .update({ estado: "inactivo" })
      .eq("id", id);
  };

  const logBitacora = async (accion, user) => {
    await supabase.from("bitacora").insert({
      accion,
      tabla_afectada: "perfil_usuario",
      registro_id: user.id,
      detalles: `Usuario: ${user.nombre_completo}, Email: ${user.email}`,
      usuario_id: userAdmin?.id || null,
    });
  };

  const toggleUser = async (user) => {
    const activar = user.estado === "inactivo";

    const confirmMsg = activar
      ? `¿Desea activar al usuario "${user.nombre_completo}"?`
      : `¿Desea desactivar al usuario "${user.nombre_completo}"?`;

    if (!confirm(confirmMsg)) return;

    const nuevoEstado = activar ? "activo" : "inactivo";

    await supabase
      .from("perfil_usuario")
      .update({ estado: nuevoEstado })
      .eq("id", user.id);

    await logBitacora(
      activar ? "Activar usuario" : "Desactivar usuario",
      user
    );

    refetch();
  };

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
            <Button onClick={() => setOpenAdd(true)}>
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
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5}>Cargando...</TableCell>
                </TableRow>
              )}

              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.nombre_completo}</div>
                      <div className="text-sm text-muted-foreground">
                        Último acceso: {user.last_access ?? "—"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{user.rol}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={user.estado === "activo" ? "default" : "outline"}>
                      {user.estado}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm">{user.email}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">

                      {/* Botón Editar Permisos */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenEdit(true);
                        }}
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Editar
                      </Button>

                      {/* Switch Activar/Desactivar */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.estado === "activo"}
                          onCheckedChange={() => toggleUser(user)}
                        />
                        <span className="text-sm">
                          {user.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* === MODALES === */}
      <AddUserModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => refetch()}
      />

      <EditUserModal
        open={openEdit}
        user={selectedUser}
        onClose={() => setOpenEdit(false)}
        onUpdated={() => refetch()}
      />
    </div>
  );
}
