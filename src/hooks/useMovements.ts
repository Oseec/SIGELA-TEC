// src/hooks/useMovements.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface Movement {
  id: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: { nombre_completo: string } | null;
}

interface RawMovement {
  id: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: { nombre_completo: string }[] | null;
}

export const useMovements = (recursoId: number) => {
  return useQuery<Movement[]>({
    queryKey: ['movements', recursoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movimiento_inventario')
        .select(`
          id,
          tipo,
          cantidad,
          motivo,
          fecha,
          usuario:usuario_id (nombre_completo)
        `)
        .eq('recurso_id', recursoId)
        .order('fecha', { ascending: false });

      if (error) throw error;

      return (data as RawMovement[]).map(m => ({
        ...m,
        usuario: m.usuario && m.usuario.length > 0 
          ? { nombre_completo: m.usuario[0].nombre_completo }
          : null
      }));
    },
    enabled: !!recursoId
  });
};