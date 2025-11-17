// src/components/ReservationRequestModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

export interface RecursoBusqueda {
  recurso_id: number;
  recurso_nombre: string;
  laboratorio_id: number;
  laboratorio_nombre: string;
  laboratorio_ubicacion?: string | null;
  cantidad_disponible: number;
}

interface ReservationRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurso: RecursoBusqueda | null;
  fechaSeleccionada: string;        // "YYYY-MM-DD"
  horaInicio?: string;              // "HH:MM"
  horaFin?: string;                 // "HH:MM"
}

export function ReservationRequestModal({
  open,
  onOpenChange,
  recurso,
  fechaSeleccionada,
  horaInicio,
  horaFin,
}: ReservationRequestModalProps) {
  const { user } = useAuth();

  const [cantidad, setCantidad] = useState<number>(1);
  const [motivo, setMotivo] = useState<string>("");

  // reset cuando cambia el recurso o se abre
  useEffect(() => {
    if (open && recurso) {
      setCantidad(1);
      setMotivo("");
    }
  }, [open, recurso]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para crear una solicitud");
      return;
    }

    if (!recurso) {
      toast.error("No se ha seleccionado un recurso");
      return;
    }

    if (!fechaSeleccionada || !horaInicio || !horaFin) {
      toast.error("Debes seleccionar fecha, hora de inicio y fin");
      return;
    }

    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor que cero");
      return;
    }

    if (cantidad > recurso.cantidad_disponible) {
      toast.error("La cantidad solicitada supera la disponible");
      return;
    }

    try {
      const inicioIso = `${fechaSeleccionada}T${horaInicio}:00`;
      const finIso = `${fechaSeleccionada}T${horaFin}:00`;

      const { data, error } = await supabase.rpc("crear_solicitud_simple", {
        p_usuario_id: user.id,
        p_laboratorio_id: recurso.laboratorio_id,
        p_recurso_id: recurso.recurso_id,
        p_cantidad: cantidad,
        p_fecha_hora_inicio: inicioIso,
        p_fecha_hora_fin: finIso,
        p_motivo: motivo || `Solicitud de uso de ${recurso.recurso_nombre}`,
        p_documentos: {}, // si luego manejan adjuntos, se cambia esto
      });

      if (error) {
        console.error(error);
        toast.error("Error al crear la solicitud");
        return;
      }

      if (!data || data.length === 0) {
        toast.error("No se pudo crear la solicitud");
        return;
      }

      const result = data[0] as {
        solicitud_id: number | null;
        estado: string;
        mensaje: string;
      };

      if (!result.solicitud_id) {
        toast.error(result.mensaje || "No se pudo crear la solicitud");
        return;
      }

      toast.success(result.mensaje || "Solicitud creada correctamente");
      handleClose();
    } catch (e) {
      console.error(e);
      toast.error("Ocurrió un error inesperado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitud de uso / reserva</DialogTitle>
          <DialogDescription>
            Completa los datos para enviar tu solicitud. Se validarán
            disponibilidad y requisitos automáticamente.
          </DialogDescription>
        </DialogHeader>

        {!recurso ? (
          <p className="text-sm text-muted-foreground">
            No se ha seleccionado ningún recurso.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Recurso</Label>
              <p className="text-sm font-medium">
                {recurso.recurso_nombre}
              </p>
              <p className="text-xs text-muted-foreground">
                {recurso.laboratorio_nombre}
                {recurso.laboratorio_ubicacion
                  ? ` • ${recurso.laboratorio_ubicacion}`
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Cantidad disponible: {recurso.cantidad_disponible}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={fechaSeleccionada}
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <Label>Hora inicio</Label>
                <Input
                  type="time"
                  value={horaInicio || ""}
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <Label>Hora fin</Label>
                <Input
                  type="time"
                  value={horaFin || ""}
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Cantidad a solicitar</Label>
              <Input
                type="number"
                min={1}
                max={recurso.cantidad_disponible}
                value={cantidad}
                onChange={(e) =>
                  setCantidad(Number(e.target.value) || 1)
                }
              />
              <p className="text-xs text-muted-foreground">
                Máximo: {recurso.cantidad_disponible}
              </p>
            </div>

            <div className="space-y-1">
              <Label>Motivo de la solicitud</Label>
              <Textarea
                placeholder="Ejemplo: práctica de laboratorio, proyecto de curso, investigación..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Enviar solicitud
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
