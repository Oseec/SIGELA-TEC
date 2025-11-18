// src/components/lab/ResponsibleList.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Phone, Mail, Plus, Search, Trash2 } from "lucide-react";
import { useLabAdmin } from "@/hooks/useLabAdmin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";

export default function ResponsibleList() {
  const { laboratorio, responsables = [] } = useLabAdmin();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Técnicos disponibles
  const { data: tecnicosDisponibles = [] } = useQuery({
    queryKey: ["tecnicos_disponibles", search],
    queryFn: async () => {
      const { data } = await supabase
        .from("perfil_usuario")
        .select("id, nombre_completo, carnet_o_codigo, telefono, rol")
        .in("rol", ["tecnico", "lab_admin"])
        .ilike("nombre_completo", `%${search}%`)
        .order("nombre_completo");
      return data ?? [];
    },
    enabled: open,
  });

  const responsablesIds = responsables.map(r => r.usuario_id);

  // MUTACIONES
  const agregarResponsable = useMutation({
    mutationFn: async (usuarioId: string) => {
      const { error } = await supabase
        .from("responsable_laboratorio")
        .insert({
          laboratorio_id: laboratorio!.id,
          usuario_id: usuarioId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsables', laboratorio?.id] });
      queryClient.invalidateQueries({ queryKey: ["lab_admin"] });
      setOpen(false);
    },
  });

  const eliminarResponsable = useMutation({
    mutationFn: async (usuarioId: string) => {
      const { error } = await supabase
        .from("responsable_laboratorio")
        .delete()
        .eq("laboratorio_id", laboratorio!.id)
        .eq("usuario_id", usuarioId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsables', laboratorio?.id] });
      queryClient.invalidateQueries({ queryKey: ["lab_admin"] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Responsables del Laboratorio</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Responsable
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Seleccionar Técnico o Encargado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tecnicosDisponibles
                        .filter(t => !responsablesIds.includes(t.id))
                        .map((tecnico) => (
                          <TableRow key={tecnico.id}>
                            <TableCell className="font-medium">{tecnico.nombre_completo}</TableCell>
                            <TableCell>{tecnico.carnet_o_codigo}</TableCell>
                            <TableCell className="capitalize">
                              {tecnico.rol === "tecnico" ? "Técnico" : "Jefe de Lab"}
                            </TableCell>
                            <TableCell>{tecnico.telefono || "-"}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => agregarResponsable.mutate(tecnico.id)}
                                disabled={agregarResponsable.isPending}
                              >
                                Agregar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {tecnicosDisponibles.filter(t => !responsablesIds.includes(t.id)).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay más técnicos disponibles
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {responsables.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay responsables asignados aún
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Teléfono/Email</TableHead>
                <TableHead className="w-28">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responsables.map((r) => {
                
                const cantidadJefes = responsables.filter(res => res.rol === "lab_admin").length;
                const esUltimoJefe = cantidadJefes === 1 && r.rol === "lab_admin";

                return (
                  <TableRow key={r.usuario_id}>
                    <TableCell className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {r.nombre_completo}
                    </TableCell>
                    <TableCell className="capitalize">
                      {r.rol === "tecnico" ? "Técnico" : "Jefe de Laboratorio"}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {r.telefono || "-"}
                    </TableCell>
                    <TableCell className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      {r.email || "No registrado"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={esUltimoJefe || eliminarResponsable.isPending}
                        title={esUltimoJefe ? "Debe haber al menos un jefe de laboratorio" : undefined}
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${r.nombre_completo} de los responsables?`)) {
                            eliminarResponsable.mutate(r.usuario_id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}