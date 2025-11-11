// src/components/DeliveryModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from '../lib/supabaseClient';
import { toast } from "@/components/ui/sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: number;
}

export default function DeliveryModal({ isOpen, onClose, solicitudId }: Props) {
  const [loading, setLoading] = useState(false);

  const mark = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('mark_delivery', { 
        p_solicitud_id: solicitudId
      });
      if (error) throw error;
      toast.success("Entrega registrada");
    } catch (err) {
      toast.error("Error en entrega");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar Entrega</DialogTitle>
        </DialogHeader>
        <Button onClick={mark} disabled={loading}>
          {loading ? "Registrando..." : "Confirmar Entrega"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}