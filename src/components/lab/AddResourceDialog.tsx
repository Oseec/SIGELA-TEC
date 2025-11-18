import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddResourceDialog({ open, onClose, laboratorioId, onCreated }) {
  const [tipo, setTipo] = useState("fijo"); // fijo | consumible
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [stock, setStock] = useState("");
  const [puntoReorden, setPuntoReorden] = useState("");

  const handleSave = async () => {
    if (!nombre) return;

    if (tipo === "fijo") {
      const { error } = await supabase.from("recurso_fijo").insert({
        nombre,
        codigo,
        estado: "disponible",
        laboratorio_id: laboratorioId,
      });

      if (error) {
        console.error(error);
        return;
      }
    }

    if (tipo === "consumible") {
      const { error } = await supabase.from("recurso_consumible").insert({
        nombre,
        stock: Number(stock),
        punto_reorden: Number(puntoReorden),
        laboratorio_id: laboratorioId,
      });

      if (error) {
        console.error(error);
        return;
      }
    }

    onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar nuevo recurso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>Tipo de recurso</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fijo">Recurso fijo (equipo)</SelectItem>
              <SelectItem value="consumible">Material consumible</SelectItem>
            </SelectContent>
          </Select>

          <div>
            <Label>Nombre</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          {tipo === "fijo" && (
            <div>
              <Label>Código de inventario</Label>
              <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>
          )}

          {tipo === "consumible" && (
            <>
              <div>
                <Label>Stock inicial</Label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>

              <div>
                <Label>Punto de reorden</Label>
                <Input
                  type="number"
                  value={puntoReorden}
                  onChange={(e) => setPuntoReorden(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
