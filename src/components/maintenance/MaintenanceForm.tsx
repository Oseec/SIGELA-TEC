// src/components/maintenance/MaintenanceForm.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useResources } from "@/hooks/useResources";

interface FormData {
  recurso_id: number;
  tipo: 'preventivo' | 'correctivo';
  fecha: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

export default function MaintenanceForm({ isOpen, onClose, onSave }: Props) {
  const { resources } = useResources();
  const [form, setForm] = useState<FormData>({
    recurso_id: 0,
    tipo: "preventivo",
    fecha: ""
  });

  const handleSave = () => {
  if (form.recurso_id === 0 || !form.fecha) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar Mantenimiento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Recurso</label>
            <Select 
              value={form.recurso_id.toString()} 
              onValueChange={v => setForm({...form, recurso_id: Number(v)})}
            >
              <SelectTrigger><SelectValue placeholder="Selecciona equipo" /></SelectTrigger>
              <SelectContent>
                {resources?.filter(r => r.tipo === 'equipo').map(r => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.nombre} ({r.codigo_inventario})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v as 'preventivo' | 'correctivo'})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="preventivo">Preventivo</SelectItem>
                <SelectItem value="correctivo">Correctivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Fecha Programada</label>
            <Input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={form.recurso_id === 0 || !form.fecha}>
              Programar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}