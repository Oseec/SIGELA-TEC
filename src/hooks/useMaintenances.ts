// src/hooks/useMaintenances.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export interface Maintenance {
  id: number;
  recurso_id: number;
  tipo: 'preventivo' | 'correctivo';
  fecha_programada: string;
  fecha_realizada: string | null;
  tecnico: { nombre_completo: string };
  detalles: string | null;
  repuestos_usados: string | null;
  estado_final: 'disponible' | 'inactivo' | null;
  recurso: { nombre: string; laboratorio: { nombre: string } };
}

export const useMaintenances = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: maintenances, isLoading } = useQuery<Maintenance[]>({
    queryKey: ['maintenances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mantenimiento')
        .select(`
          *,
          tecnico:tecnico_id (nombre_completo),
          recurso:recurso_id (nombre, laboratorio:laboratorio_id (nombre))
        `)
        .order('fecha_programada', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const schedule = useMutation({
    mutationFn: async (data: { recurso_id: number; tipo: string; fecha: string }) => {
      const { error } = await supabase.rpc('schedule_maintenance', {
        p_recurso_id: data.recurso_id,
        p_tipo: data.tipo,
        p_fecha_programada: data.fecha,
        p_tecnico_id: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    }
  });

  const complete = useMutation({
    mutationFn: async (data: { id: number; detalles: string; repuestos: string; estado: string }) => {
      const { error } = await supabase.rpc('complete_maintenance', {
        p_id: data.id,
        p_detalles: data.detalles,
        p_repuestos_usados: data.repuestos,
        p_estado_final: data.estado
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    }
  });

  return { maintenances, isLoading, schedule, complete };
};