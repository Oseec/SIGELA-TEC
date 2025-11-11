// src/hooks/useApprovedRequests.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export interface Request {
  id: number;
  usuario_id: { id: string; nombre_completo: string };
  laboratorio_id: { id: number; name: string };
  recursos_solicitados: Array<{ recurso_id: number; nombre: string; cantidad: number }>;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  estado: string;
  motivo: string;
}

export const useApprovedRequests = () => {
  return useQuery<Request[]>({
    queryKey: ['approved_requests'],
    queryFn: async () => {
      // Solicitudes aprobadas (simple)
      const { data: solicitudes, error: errorSolic } = await supabase
        .from('solicitud')
        .select('id, fecha_hora_inicio, fecha_hora_fin, motivo, estado, usuario_id, laboratorio_id, detalle_solicitud (recurso_id, cantidad_entregada)')
        .eq('estado', 'aprobada');

      if (errorSolic) throw errorSolic;

      // Usuarios para todas las solicitudes
      const usuarioIds = solicitudes.map(s => s.usuario_id);
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('perfil_usuario')
        .select('id, nombre_completo')
        .in('id', usuarioIds);

      if (errorUsuarios) throw errorUsuarios;

      // Laboratorios
      const labIds = solicitudes.map(s => s.laboratorio_id);
      const { data: labs, error: errorLabs } = await supabase
        .from('laboratorio')
        .select('id, nombre')
        .in('id', labIds);

      if (errorLabs) throw errorLabs;

      // Nombres de recursos
      const recursoIds = solicitudes.flatMap(s => s.detalle_solicitud.map(d => d.recurso_id));
      const { data: recursos, error: errorRecursos } = await supabase
        .from('recurso')
        .select('id, nombre')
        .in('id', recursoIds);

      if (errorRecursos) throw errorRecursos;

      // Mapear todo
      return solicitudes.map((solicitud): Request => {
        // Usuario
        const usuario = usuarios.find(u => u.id === solicitud.usuario_id) || { id: '', nombre_completo: 'Desconocido' };

        // Laboratorio
        const laboratorio = labs.find(l => l.id === solicitud.laboratorio_id) || { id: 0, nombre: 'Sin laboratorio' };

        // Recursos
        const recursosSolicitados = solicitud.detalle_solicitud.map(d => {
          const recurso = recursos.find(r => r.id === d.recurso_id) || { id: d.recurso_id, nombre: `Recurso ID: ${d.recurso_id}` };
          return {
            recurso_id: d.recurso_id,
            nombre: recurso.nombre,
            cantidad: d.cantidad_entregada || 1,
          };
        });

        return {
          id: solicitud.id,
          usuario_id: {
            id: usuario.id,
            nombre_completo: usuario.nombre_completo,
          },
          laboratorio_id: {
            id: laboratorio.id,
            name: laboratorio.nombre,
          },
          recursos_solicitados: recursosSolicitados,
          fecha_hora_inicio: solicitud.fecha_hora_inicio,
          fecha_hora_fin: solicitud.fecha_hora_fin,
          estado: solicitud.estado,
          motivo: solicitud.motivo,
        };
      });
    },
  });
};