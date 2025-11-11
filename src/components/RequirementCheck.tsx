// src/components/RequirementCheck.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/sonner";

interface RequirementCheckProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: string;
  laboratorioId: number;
}

export default function RequirementCheck({ isOpen, onClose, usuarioId, laboratorioId }: RequirementCheckProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ cumple: boolean; mensaje: string } | null>(null);

  const verificar = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .rpc('check_requirements', {
        p_usuario_id: usuarioId,
        p_laboratorio_id: laboratorioId
      });

    if (error) throw error;

    const res = data[0];
    setResult({ cumple: res.cumple, mensaje: res.mensaje });
    toast.success(res.mensaje);
  } catch (err) {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Error desconocido';
  toast.error("Error en validación: " + message);
 } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validar Requisitos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={verificar} disabled={loading} className="w-full">
            {loading ? "Verificando..." : "Verificar Certificaciones"}
          </Button>

          {result && (
            <Alert variant={result.cumple ? "default" : "destructive"}>
              <AlertDescription>
                <strong>{result.cumple ? "Cumple" : "NO cumple"}</strong>: {result.mensaje}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}