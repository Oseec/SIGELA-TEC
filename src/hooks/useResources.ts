// src/hooks/useResources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface Resource {
  id: number;
  nombre: string;
  tipo: 'equipo' | 'consumible';
  codigo_inventario: string;
  estado: 'disponible' | 'reservado' | 'en_mantenimiento' | 'inactivo';
  cantidad_total: number;
  cantidad_disponible: number;
  punto_reorden: number;
  unidad_medida: string | null;
  laboratorio: {
    nombre: string;
    ubicacion: string;
  };
}

export const useResources = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurso')
        .select(`
          *,
          laboratorio:laboratorio_id (nombre, ubicacion)
        `)
        .order('nombre');

      if (error) throw error;

      return data.map(r => ({
        ...r,
        cantidad_disponible: r.cantidad_total - (r.estado === 'reservado' ? 1 : 0)
      }));
    }
  });

  const upsert = useMutation({
    mutationFn: async (resource: Partial<Resource>) => {
      const { data, error } = await supabase.rpc('upsert_resource', {
        p_id: resource.id,
        p_laboratorio_id: 1,
        p_tipo_recurso: resource.tipo,
        p_nombre: resource.nombre,
        p_codigo_inventario: resource.codigo_inventario,
        p_cantidad_total: resource.cantidad_total,
        p_unidad_medida: resource.unidad_medida,
        p_punto_reorden: resource.punto_reorden
      });
      if (error) throw error;

      if (resource.id && user?.id) {
        const old = resources?.find(r => r.id === resource.id);
        if (old && old.cantidad_total !== resource.cantidad_total) {
          const diff = resource.cantidad_total! - old.cantidad_total;
          await supabase.rpc('register_movement', {
            p_recurso_id: resource.id,
            p_tipo: diff > 0 ? 'entrada' : 'salida',
            p_cantidad: Math.abs(diff),
            p_motivo: 'Ajuste de inventario',
            p_usuario_id: user.id
          });
        }
      }

      // Actualiza estado
      if (resource.estado && resource.id) {
        await supabase
          .from('recurso')
          .update({ estado: resource.estado })
          .eq('id', resource.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success("Recurso guardado");
    },
    onError: () => toast.error("Error al guardar")
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc('delete_resource', { p_id: id });
      if (error) throw error;

      // Registra movimiento de baja
      if (user?.id) {
        await supabase.rpc('register_movement', {
          p_recurso_id: id,
          p_tipo: 'salida',
          p_cantidad: 0,
          p_motivo: 'Baja de recurso',
          p_usuario_id: user.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success("Recurso dado de baja");
    }
  });

  return { resources, isLoading, upsert, remove };
};