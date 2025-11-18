// src/components/lab/ResourceList.tsx
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLabAdmin } from "@/hooks/useLabAdmin";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/sonner";

type LabResource = {
  id: number;
  tipo: "equipo" | "consumible";
  nombre: string;
  codigo_inventario?: string | null;
  estado: string;
  ultima_mantenimiento?: string | null;
  cantidad_total?: number | null;
  punto_reorden?: number | null;
};

interface AddResourceDialogProps {
  laboratorioId: number;
  initialTipo: "equipo" | "consumible";
  onCreated: (recurso: LabResource) => void;
}

/**
 * Modal para crear un recurso nuevo del laboratorio
 */
function AddResourceDialog({
  laboratorioId,
  initialTipo,
  onCreated,
}: AddResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"equipo" | "consumible">(initialTipo);
  const [nombre, setNombre] = useState("");
  const [codigoInventario, setCodigoInventario] = useState("");
  const [estado, setEstado] = useState("disponible");
  const [cantidadTotal, setCantidadTotal] = useState("");
  const [puntoReorden, setPuntoReorden] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setTipo(initialTipo);
    setNombre("");
    setCodigoInventario("");
    setEstado("disponible");
    setCantidadTotal("");
    setPuntoReorden("");
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) resetForm();
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error("Debes ingresar un nombre");
      return;
    }

    if (!codigoInventario.trim()) {
      toast.error("Debes ingresar un código de inventario");
      return;
    }

    if (tipo === "consumible" && !cantidadTotal) {
      toast.error("Debes indicar el stock inicial");
      return;
    }

    try {
      setIsSaving(true);

      const cantidad = tipo === "consumible" ? Number(cantidadTotal) || 0 : 1;
      const reorder = tipo === "consumible" ? Number(puntoReorden) || 0 : null;

      const { data, error } = await supabase
        .from("recurso")
        .insert({
          laboratorio_id: laboratorioId,
          tipo,
          nombre: nombre.trim(),
          codigo_inventario: codigoInventario.trim(),
          estado,
          cantidad_total: cantidad,
          punto_reorden: reorder,
          unidad_medida: tipo === "consumible" ? "unidades" : "unidad",
        })
        .select()
        .single();

      if (error) {
        console.error("Error insertando recurso:", error);
        toast.error("No se pudo crear el recurso");
        return;
      }

      const nuevo: LabResource = {
        id: data.id,
        tipo: data.tipo,
        nombre: data.nombre,
        codigo_inventario: data.codigo_inventario,
        estado: data.estado,
        ultima_mantenimiento: data.ultima_mantenimiento,
        cantidad_total: data.cantidad_total,
        punto_reorden: data.punto_reorden,
      };

      onCreated(nuevo);
      toast.success("Recurso creado correctamente");
      handleOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {initialTipo === "equipo" ? "Agregar equipo" : "Agregar consumible"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialTipo === "equipo" ? "Nuevo equipo" : "Nuevo consumible"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo, por si el admin quiere cambiarlo dentro del modal */}
          <div className="space-y-1">
            <Label>Tipo de recurso</Label>
            <Select
              value={tipo}
              onValueChange={(v) => setTipo(v as "equipo" | "consumible")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equipo">Equipo fijo</SelectItem>
                <SelectItem value="consumible">Material consumible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={
                tipo === "equipo" ? "Osciloscopio digital" : "Resistencias 1 kΩ"
              }
            />
          </div>

          {/* Código de inventario para cualquier tipo */}
          <div className="space-y-1">
            <Label>Código de inventario</Label>
            <Input
              value={codigoInventario}
              onChange={(e) => setCodigoInventario(e.target.value)}
              placeholder={tipo === "equipo" ? "OSC001" : "RES001"}
            />
          </div>

          {tipo === "equipo" && (
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_mantenimiento">En mantenimiento</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {tipo === "consumible" && (
            <>
              <div className="space-y-1">
                <Label>Stock inicial</Label>
                <Input
                  type="number"
                  min={0}
                  value={cantidadTotal}
                  onChange={(e) => setCantidadTotal(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div className="space-y-1">
                <Label>Punto de reorden</Label>
                <Input
                  type="number"
                  min={0}
                  value={puntoReorden}
                  onChange={(e) => setPuntoReorden(e.target.value)}
                  placeholder="20"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditResourceDialogProps {
  recurso: LabResource;
  onUpdated: (recurso: LabResource) => void;
}

/**
 * Modal para editar un recurso existente
 */
function EditResourceDialog({ recurso, onUpdated }: EditResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState(recurso.nombre);
  const [codigoInventario, setCodigoInventario] = useState(
    recurso.codigo_inventario ?? ""
  );
  const [estado, setEstado] = useState(recurso.estado || "disponible");
  const [cantidadTotal, setCantidadTotal] = useState(
    recurso.cantidad_total != null ? String(recurso.cantidad_total) : ""
  );
  const [puntoReorden, setPuntoReorden] = useState(
    recurso.punto_reorden != null ? String(recurso.punto_reorden) : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const tipo = recurso.tipo;

  const loadFromResource = () => {
    setNombre(recurso.nombre);
    setCodigoInventario(recurso.codigo_inventario ?? "");
    setEstado(recurso.estado || "disponible");
    setCantidadTotal(
      recurso.cantidad_total != null ? String(recurso.cantidad_total) : ""
    );
    setPuntoReorden(
      recurso.punto_reorden != null ? String(recurso.punto_reorden) : ""
    );
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) {
      loadFromResource();
    }
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error("Debes ingresar un nombre");
      return;
    }

    if (!codigoInventario.trim()) {
      toast.error("Debes ingresar un código de inventario");
      return;
    }

    if (tipo === "consumible" && !cantidadTotal) {
      toast.error("Debes indicar el stock");
      return;
    }

    try {
      setIsSaving(true);

      const payload: any = {
        nombre: nombre.trim(),
        codigo_inventario: codigoInventario.trim(),
      };

      if (tipo === "equipo") {
        payload.estado = estado;
      }

      if (tipo === "consumible") {
        payload.cantidad_total = Number(cantidadTotal) || 0;
        payload.punto_reorden = Number(puntoReorden) || 0;
      }

      const { data, error } = await supabase
        .from("recurso")
        .update(payload)
        .eq("id", recurso.id)
        .select()
        .single();

      if (error) {
        console.error("Error actualizando recurso:", error);
        toast.error("No se pudo actualizar el recurso");
        return;
      }

      const actualizado: LabResource = {
        id: data.id,
        tipo: data.tipo,
        nombre: data.nombre,
        codigo_inventario: data.codigo_inventario,
        estado: data.estado,
        ultima_mantenimiento: data.ultima_mantenimiento,
        cantidad_total: data.cantidad_total,
        punto_reorden: data.punto_reorden,
      };

      onUpdated(actualizado);
      toast.success("Recurso actualizado correctamente");
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="xs" variant="outline">
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Editar {tipo === "equipo" ? "equipo" : "consumible"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Tipo de recurso</Label>
            <p className="text-sm text-muted-foreground">
              {tipo === "equipo" ? "Equipo fijo" : "Material consumible"}
            </p>
          </div>

          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Código de inventario</Label>
            <Input
              value={codigoInventario}
              onChange={(e) => setCodigoInventario(e.target.value)}
            />
          </div>

          {tipo === "equipo" && (
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_mantenimiento">En mantenimiento</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {tipo === "consumible" && (
            <>
              <div className="space-y-1">
                <Label>Stock</Label>
                <Input
                  type="number"
                  min={0}
                  value={cantidadTotal}
                  onChange={(e) => setCantidadTotal(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label>Punto de reorden</Label>
                <Input
                  type="number"
                  min={0}
                  value={puntoReorden}
                  onChange={(e) => setPuntoReorden(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =======================================
// Listado principal
// =======================================

export default function ResourceList() {
  const { recursos, laboratorio } = useLabAdmin();
  const [localRecursos, setLocalRecursos] = useState<LabResource[]>(
    recursos as LabResource[]
  );

  useEffect(() => {
    setLocalRecursos(recursos as LabResource[]);
  }, [recursos]);

  const equipos = localRecursos.filter((r) => r.tipo === "equipo");
  const consumibles = localRecursos.filter((r) => r.tipo === "consumible");

  if (!laboratorio) return null;

  return (
    <Tabs defaultValue="equipos">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="equipos">Equipos ({equipos.length})</TabsTrigger>
        <TabsTrigger value="consumibles">
          Consumibles ({consumibles.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="equipos">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Equipos Fijos</CardTitle>
            <AddResourceDialog
              laboratorioId={laboratorio.id}
              initialTipo="equipo"
              onCreated={(r) => setLocalRecursos((prev) => [...prev, r])}
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Mantenimiento</TableHead>
                  <TableHead className="w-[110px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipos.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.nombre}</TableCell>
                    <TableCell>{e.codigo_inventario}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          e.estado === "disponible" ? "default" : "secondary"
                        }
                      >
                        {e.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{e.ultima_mantenimiento || "-"}</TableCell>
                    <TableCell>
                      <EditResourceDialog
                        recurso={e}
                        onUpdated={(upd) =>
                          setLocalRecursos((prev) =>
                            prev.map((r) => (r.id === upd.id ? upd : r))
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="consumibles">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Materiales Consumibles</CardTitle>
            <AddResourceDialog
              laboratorioId={laboratorio.id}
              initialTipo="consumible"
              onCreated={(r) => setLocalRecursos((prev) => [...prev, r])}
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Punto Reorden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[110px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumibles.map((c) => {
                  const esCritico =
                    typeof c.cantidad_total === "number" &&
                    typeof c.punto_reorden === "number" &&
                    c.cantidad_total <= c.punto_reorden;

                  return (
                    <TableRow key={c.id}>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell>{c.cantidad_total}</TableCell>
                      <TableCell>{c.punto_reorden}</TableCell>
                      <TableCell>
                        <Badge variant={esCritico ? "destructive" : "default"}>
                          {esCritico ? "Crítico" : "Normal"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <EditResourceDialog
                          recurso={c}
                          onUpdated={(upd) =>
                            setLocalRecursos((prev) =>
                              prev.map((r) => (r.id === upd.id ? upd : r))
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
