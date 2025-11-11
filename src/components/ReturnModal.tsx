// src/components/ReturnModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from '../lib/supabaseClient';
import { toast } from "@/components/ui/sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: number;
}

export default function ReturnModal({ isOpen, onClose, solicitudId }: Props) {
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  const mark = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('mark_return', {
        p_solicitud_id: solicitudId,    
        p_observaciones: observaciones   
      });
      if (error) throw error;
      toast.success("Devolución registrada");
    } catch (err) {
      console.error(err);
      toast.error("Error en devolución");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar Devolución</DialogTitle>
        </DialogHeader>
        <Input 
          placeholder="Observaciones (ej: buen estado)" 
          value={observaciones} 
          onChange={(e) => setObservaciones(e.target.value)} 
        />
        <Button onClick={mark} disabled={loading}>
          {loading ? "Registrando..." : "Confirmar Devolución"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}