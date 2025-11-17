// src/hooks/useLabAdmin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Tipos finales que usamos en la UI
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
  id: number;
  cargo: string;
  telefono: string | null;
  nombre_completo: string;
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

// Tipos internos para datos crudos
type ResponsableRaw = {
  id: number;
  cargo: string;
  telefono: string | null;
  usuario_id: string;
};

type PerfilUsuario = {
  id: string;
  nombre_completo: string;
};

type BitacoraRaw = {
  id: number;
  fecha_hora: string;
  accion: string;
  usuario_id: string | null;
};

export const useLabAdmin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Laboratorio del usuario
  const { data: laboratorio, isLoading } = useQuery<Laboratorio | null>({
    queryKey: ['mi_laboratorio', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: rl } = await supabase
        .from('responsable_laboratorio')
        .select('laboratorio_id')
        .eq('usuario_id', user.id)
        .single();

      if (!rl) throw new Error('No eres responsable de ningún laboratorio');

      const { data: lab } = await supabase
        .from('laboratorio')
        .select('*')
        .eq('id', rl.laboratorio_id)
        .single();

      return lab || null;
    },
    enabled: !!user?.id,
  });

  // 2. Recursos
  const { data: recursos = [] } = useQuery<Recurso[]>({
    queryKey: ['recursos', laboratorio?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('recurso')
        .select('*')
        .eq('laboratorio_id', laboratorio!.id)
        .order('nombre');
      return data ?? [];
    },
    enabled: !!laboratorio?.id,
  });

  // 3. Responsables → 100% tipado, sin any
  const { data: responsables = [] } = useQuery<Responsable[]>({
    queryKey: ['responsables', laboratorio?.id],
    queryFn: async () => {
      const { data: raw } = await supabase
        .from('responsable_laboratorio')
        .select('id, cargo, telefono, usuario_id')
        .eq('laboratorio_id', laboratorio!.id) as { data: ResponsableRaw[] | null };

      if (!raw || raw.length === 0) return [];

      const userIds = raw.map(r => r.usuario_id);
      const { data: perfiles } = await supabase
        .from('perfil_usuario')
        .select('id, nombre_completo')
        .in('id', userIds) as { data: PerfilUsuario[] | null };

      const perfilMap = new Map(perfiles?.map(p => [p.id, p.nombre_completo]) ?? []);

      return raw.map((r): Responsable => ({
        id: r.id,
        cargo: r.cargo,
        telefono: r.telefono,
        nombre_completo: perfilMap.get(r.usuario_id) ?? 'Sin nombre',
      }));
    },
    enabled: !!laboratorio?.id,
  });

  // 4. Bitácora → 100% tipado, sin any
  const { data: bitacora = [] } = useQuery<BitacoraEntry[]>({
    queryKey: ['bitacora', laboratorio?.id],
    queryFn: async () => {
      const { data: raw } = await supabase
        .from('bitacora')
        .select('id, fecha_hora, accion, usuario_id')
        .or(`registro_id.eq.${laboratorio!.id},tabla_afectada.eq.laboratorio`)
        .order('fecha_hora', { ascending: false })
        .limit(50) as { data: BitacoraRaw[] | null };

      if (!raw || raw.length === 0) return [];

      const userIds = raw.map(b => b.usuario_id).filter(Boolean) as string[];
      const { data: perfiles } = userIds.length > 0
        ? await supabase
            .from('perfil_usuario')
            .select('id, nombre_completo')
            .in('id', userIds) as { data: PerfilUsuario[] | null }
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
      const { error } = await supabase
        .from('laboratorio')
        .update(updates)
        .eq('id', laboratorio!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mi_laboratorio'] }),
  });

  return {
    laboratorio,
    isLoading,
    recursos,
    responsables,
    bitacora,
    updateLab: updateLab.mutateAsync,
    isUpdating: updateLab.isPending,
  };
};