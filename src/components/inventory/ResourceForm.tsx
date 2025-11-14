// src/components/inventory/ResourceForm.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Resource } from "@/hooks/useResources";

type EstadoRecurso = 'disponible' | 'reservado' | 'en_mantenimiento' | 'inactivo';

interface FormData {
  nombre: string;
  codigo_inventario: string;
  tipo: 'equipo' | 'consumible';
  cantidad_total: number;
  unidad_medida: string;
  punto_reorden: number;
  estado: EstadoRecurso;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resource?: Resource | null;
  onSave: (data: FormData & { id?: number }) => void;
}

export default function ResourceForm({ isOpen, onClose, resource, onSave }: Props) {
  const [form, setForm] = useState<FormData>({
    nombre: "",
    codigo_inventario: "",
    tipo: "equipo",
    cantidad_total: 1,
    unidad_medida: "",
    punto_reorden: 0,
    estado: "disponible"
  });

  useEffect(() => {
    if (resource && isOpen) {
      setForm({
        nombre: resource.nombre,
        codigo_inventario: resource.codigo_inventario,
        tipo: resource.tipo,
        cantidad_total: resource.cantidad_total,
        unidad_medida: resource.unidad_medida || "",
        punto_reorden: resource.punto_reorden,
        estado: resource.estado
      });
    } else if (!resource && isOpen) {
      setForm({
        nombre: "",
        codigo_inventario: "",
        tipo: "equipo",
        cantidad_total: 1,
        unidad_medida: "",
        punto_reorden: 0,
        estado: "disponible"
      });
    }
  }, [resource, isOpen]);

  const handleSave = () => {
    onSave({
      id: resource?.id,
      ...form
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {resource ? `Editar: ${resource.nombre}` : "Nuevo Recurso"}
          </DialogTitle>
          <DialogDescription>
            {resource ? `ID: ${resource.id} | Código: ${resource.codigo_inventario}` : "Complete todos los campos obligatorios"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium block mb-1">Nombre *</label>
            <Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Código de Inventario *</label>
            <Input value={form.codigo_inventario} onChange={e => setForm({...form, codigo_inventario: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Tipo</label>
            <Select 
              value={form.tipo} 
              onValueChange={(value: 'equipo' | 'consumible') => setForm({...form, tipo: value})}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="equipo">Equipo</SelectItem>
                <SelectItem value="consumible">Consumible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Cantidad Total</label>
            <Input type="number" value={form.cantidad_total} onChange={e => setForm({...form, cantidad_total: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Unidad de Medida</label>
            <Input value={form.unidad_medida} onChange={e => setForm({...form, unidad_medida: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Punto de Reorden (alerta)</label>
            <Input type="number" value={form.punto_reorden} onChange={e => setForm({...form, punto_reorden: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Estado</label>
            <Select 
              value={form.estado} 
              onValueChange={(value: EstadoRecurso) => setForm({...form, estado: value})}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
                <SelectItem value="en_mantenimiento">En Mantenimiento</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}