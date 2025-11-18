import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Solicitud } from "@/types/solicitudes";

interface CancelReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitud: Solicitud | null;
  onCancelSuccess: () => void;
}

export default function CancelReservationDialog({
  open,
  onOpenChange,
  solicitud,
  onCancelSuccess,
}: CancelReservationDialogProps) {
  const { user } = useAuth();
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!solicitud || !user) return;

    setCanceling(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("cancelar_solicitud", {
      p_solicitud_id: solicitud.solicitud_id,
      p_usuario_id: user.id,
    });

    if (rpcError) {
      console.error("Error cancelando solicitud:", rpcError);
      setError("Ocurrió un error al cancelar la solicitud. Intenta nuevamente.");
      setCanceling(false);
      return;
    }

    if (data && data.length > 0) {
      const result = data[0];
      if (result.success) {
        onCancelSuccess();
        onOpenChange(false);
      } else {
        setError(result.message);
      }
    }

    setCanceling(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Cancelar Solicitud
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas cancelar esta solicitud?
          </DialogDescription>
        </DialogHeader>

        {solicitud && (
          <div className="space-y-2 py-4">
            <div className="text-sm">
              <span className="font-semibold">Recurso:</span>{" "}
              {solicitud.recurso_nombre}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Laboratorio:</span>{" "}
              {solicitud.laboratorio_nombre}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Fecha:</span>{" "}
              {solicitud.fecha_inicio}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Horario:</span>{" "}
              {solicitud.hora_inicio} - {solicitud.hora_fin}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={canceling}
          >
            No, mantener
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={canceling}
          >
            {canceling ? "Cancelando..." : "Sí, cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}