// src/hooks/useLabAdmin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { create } from 'zustand';
import { useEffect } from 'react';

// TIPOS
export type Laboratorio = {
  id: number;
  nombre: string;
  codigo: string;
  ubicacion: string;
  descripcion: string | null;
  capacidad_maxima: number;
  horario_funcionamiento: Record<string, unknown>;
  politicas: Record<string, unknown>;
};

export type Responsable = {
  usuario_id: string;
  nombre_completo: string;
  rol: string;
  telefono: string | null;
  email: string | null;
};

export type Recurso = {
  id: number;
  tipo: 'equipo' | 'consumible';
  nombre: string;
  codigo_inventario: string;
  estado: string;
  cantidad_total: number;
  punto_reorden: number;
  ultima_mantenimiento: string | null;
};

export type BitacoraEntry = {
  id: number;
  fecha_hora: string;
  accion: string;
  nombre_usuario: string;
};


type LabStore = {
  selectedLabId: number | null;
  setSelectedLabId: (id: number | null) => void;
};

const useLabStore = create<LabStore>((set) => ({
  selectedLabId: null,
  setSelectedLabId: (id) => set({ selectedLabId: id }),
}));


export const useLabAdmin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { selectedLabId, setSelectedLabId } = useLabStore();

  // 1. Todos los laboratorios del usuario
  const { data: laboratorios = [], isLoading: loadingLabs } = useQuery<Laboratorio[]>({
    queryKey: ['mis_laboratorios', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: asignaciones } = await supabase
        .from('responsable_laboratorio')
        .select('laboratorio_id')
        .eq('usuario_id', user.id);

      if (!asignaciones || asignaciones.length === 0) return [];

      const labIds = asignaciones.map(a => a.laboratorio_id);

      const { data: labs } = await supabase
        .from('laboratorio')
        .select('*')
        .in('id', labIds);

      return labs ?? [];
    },
    enabled: !!user?.id,
  });

  // Laboratorio actual: seleccionado o el primero
  const laboratorio = laboratorios.find(l => l.id === selectedLabId) || laboratorios[0] || null;

  // Auto-seleccionar el primero si no hay selección
  useEffect(() => {
    if (laboratorios.length > 0 && !selectedLabId) {
      setSelectedLabId(laboratorios[0].id);
    }
  }, [laboratorios, selectedLabId, setSelectedLabId]);

  // 2. Recursos
  const { data: recursos = [] } = useQuery<Recurso[]>({
    queryKey: ['recursos', laboratorio?.id],
    queryFn: async () => {
      if (!laboratorio?.id) return [];
      const { data } = await supabase
        .from('recurso')
        .select('*')
        .eq('laboratorio_id', laboratorio.id)
        .order('nombre');
      return data ?? [];
    },
    enabled: !!laboratorio?.id,
  });

  // 3. Responsables
  const { data: responsables = [] } = useQuery<Responsable[]>({
    queryKey: ['responsables', laboratorio?.id],
    queryFn: async () => {
      if (!laboratorio?.id) return [];

      const { data, error } = await supabase
        .rpc('get_responsables_laboratorio', { lab_id: laboratorio.id });

      if (error) {
        console.error('Error cargando responsables:', error);
        return [];
      }

      return data as Responsable[]; 
    },
    enabled: !!laboratorio?.id,
  });

  // 4. Bitácora
  const { data: bitacora = [] } = useQuery<BitacoraEntry[]>({
    queryKey: ['bitacora', laboratorio?.id],
    queryFn: async () => {
      if (!laboratorio?.id) return [];

      const { data: raw } = await supabase
        .from('bitacora')
        .select('id, fecha_hora, accion, usuario_id')
        .or(`registro_id.eq.${laboratorio.id},tabla_afectada.eq.laboratorio`)
        .order('fecha_hora', { ascending: false })
        .limit(50);

      if (!raw || raw.length === 0) return [];

      const userIds = raw
        .map(b => b.usuario_id)
        .filter(Boolean) as string[];

      const { data: perfiles } = userIds.length > 0
        ? await supabase
            .from('perfil_usuario')
            .select('id, nombre_completo')
            .in('id', userIds)
        : { data: null };

      const perfilMap = new Map(perfiles?.map(p => [p.id, p.nombre_completo]) ?? []);

      return raw.map((b): BitacoraEntry => ({
        id: b.id,
        fecha_hora: b.fecha_hora,
        accion: b.accion,
        nombre_usuario: b.usuario_id ? (perfilMap.get(b.usuario_id) ?? 'Sistema') : 'Sistema',
      }));
    },
    enabled: !!laboratorio?.id,
  });

  // 5. Actualizar laboratorio
  const updateLab = useMutation({
    mutationFn: async (updates: Partial<Laboratorio>) => {
      if (!laboratorio?.id) throw new Error('No hay laboratorio seleccionado');
      const { error } = await supabase
        .from('laboratorio')
        .update(updates)
        .eq('id', laboratorio.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis_laboratorios'] });
      queryClient.invalidateQueries({ queryKey: ['mi_laboratorio'] });
    },
  });

  return {
    laboratorios,
    laboratorio,
    setLaboratorio: setSelectedLabId,
    recursos,
    responsables,
    bitacora,
    updateLab: updateLab.mutateAsync,
    isUpdating: updateLab.isPending,
    isLoading: loadingLabs || !laboratorio,
  };
};