// src/hooks/useRequisitosValidation.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface RequisitoUsuario {
  requisito_id: string;
  nombre_requisito: string;
  tipo: 'curso' | 'certificacion' | 'induccion' | 'otro';
  cumplido: boolean;
  fecha_cumplimiento?: string;
}

/**
 * Hook para validar si un usuario cumple con los requisitos de un laboratorio
 */
export function useRequisitosValidation(usuarioId: string, laboratorioId: number) {
  return useQuery({
    queryKey: ['validacion_requisitos', usuarioId, laboratorioId],
    queryFn: async () => {
      // 1. Obtener las políticas del laboratorio (que incluyen requisitos)
      const { data: lab, error: labError } = await supabase
        .from('laboratorio')
        .select('politicas')
        .eq('id', laboratorioId)
        .single();

      if (labError) throw labError;

      // 2. Extraer requisitos de las políticas
      const requisitosLab = lab?.politicas?.requisitos || [];
      
      if (requisitosLab.length === 0) {
        return {
          cumpleRequisitos: true,
          requisitosIncumplidos: [],
          requisitosDetalle: [],
        };
      }

      // 3. Verificar qué requisitos cumple el usuario
      // Esto dependerá de cómo guardes los requisitos del usuario
      // Por ahora, simularemos una consulta a una tabla hipotética
      
      const requisitosObligatorios = requisitosLab.filter((r: any) => r.obligatorio);
      
      // Ejemplo de verificación (ajustar según tu modelo de datos):
      // const { data: requisitosUsuario } = await supabase
      //   .from('usuario_requisito')
      //   .select('requisito_id, cumplido, fecha_cumplimiento')
      //   .eq('usuario_id', usuarioId);

      // Por ahora, retornamos una estructura de ejemplo
      const requisitosDetalle: RequisitoUsuario[] = requisitosObligatorios.map((req: any) => ({
        requisito_id: req.id,
        nombre_requisito: req.nombre,
        tipo: req.tipo,
        cumplido: false, // Aquí iría la lógica real de validación
        fecha_cumplimiento: undefined,
      }));

      const requisitosIncumplidos = requisitosDetalle
        .filter(r => !r.cumplido)
        .map(r => r.nombre_requisito);

      return {
        cumpleRequisitos: requisitosIncumplidos.length === 0,
        requisitosIncumplidos,
        requisitosDetalle,
      };
    },
    enabled: !!usuarioId && !!laboratorioId,
  });
}

/**
 * Hook para verificar disponibilidad de recursos en una fecha específica
 */
export function useRecursosDisponibilidad(
  recursos: Array<{ recurso_id: number; cantidad: number }>,
  fechaInicio: string,
  fechaFin: string
) {
  return useQuery({
    queryKey: ['disponibilidad_recursos', recursos, fechaInicio, fechaFin],
    queryFn: async () => {
      if (!recursos || recursos.length === 0) {
        return [];
      }

      const recursosIds = recursos.map(r => r.recurso_id);

      // 1. Obtener información de los recursos
      const { data: recursosDB, error } = await supabase
        .from('recurso')
        .select('id, nombre, tipo, estado, cantidad_total')
        .in('id', recursosIds);

      if (error) throw error;

      // 2. Verificar reservas existentes en el rango de fechas
      const { data: reservasExistentes } = await supabase
        .from('solicitud')
        .select('recursos_solicitados')
        .eq('estado', 'aprobada')
        .gte('fecha_hora_inicio', fechaInicio)
        .lte('fecha_hora_fin', fechaFin);

      // 3. Calcular cantidades disponibles
      const disponibilidad = recursos.map(solicitud => {
        const recurso = recursosDB?.find(r => r.id === solicitud.recurso_id);
        
        if (!recurso) {
          return {
            recurso_id: solicitud.recurso_id,
            nombre: 'Recurso no encontrado',
            tipo: 'equipo',
            cantidad_solicitada: solicitud.cantidad,
            cantidad_disponible: 0,
            disponible: false,
            motivo: 'Recurso no encontrado',
          };
        }

        // Calcular cantidad ya reservada
        const cantidadReservada = (reservasExistentes || []).reduce((total, reserva) => {
          const recursosReserva = reserva.recursos_solicitados || [];
          const recursoReserva = recursosReserva.find(
            (r: any) => r.recurso_id === solicitud.recurso_id
          );
          return total + (recursoReserva?.cantidad || 0);
        }, 0);

        const cantidadDisponible = recurso.cantidad_total - cantidadReservada;
        const hayDisponibilidad = cantidadDisponible >= solicitud.cantidad;

        return {
          recurso_id: solicitud.recurso_id,
          nombre: recurso.nombre,
          tipo: recurso.tipo,
          cantidad_solicitada: solicitud.cantidad,
          cantidad_disponible: cantidadDisponible,
          disponible: hayDisponibilidad && recurso.estado === 'disponible',
          motivo: !hayDisponibilidad
            ? `Solo hay ${cantidadDisponible} disponibles`
            : recurso.estado !== 'disponible'
            ? `Recurso ${recurso.estado}`
            : undefined,
        };
      });

      return disponibilidad;
    },
    enabled: !!recursos && recursos.length > 0 && !!fechaInicio && !!fechaFin,
  });
}

/**
 * Hook para verificar conflictos de horario en el laboratorio
 */
export function useConflictosHorario(
  laboratorioId: number,
  fechaInicio: string,
  fechaFin: string,
  excluirSolicitudId?: number
) {
  return useQuery({
    queryKey: ['conflictos_horario', laboratorioId, fechaInicio, fechaFin, excluirSolicitudId],
    queryFn: async () => {
      // 1. Verificar horarios del laboratorio
      const { data: lab } = await supabase
        .from('laboratorio')
        .select('politicas')
        .eq('id', laboratorioId)
        .single();

      const horarios = lab?.politicas?.horarios || [];
      const fechaSolicitud = new Date(fechaInicio);
      const diaSemana = fechaSolicitud
        .toLocaleDateString('es-ES', { weekday: 'long' })
        .toLowerCase();

      const horarioLab = horarios.find((h: any) => h.dia === diaSemana);
      
      if (!horarioLab || !horarioLab.abierto) {
        return {
          tieneConflictos: true,
          conflictos: ['El laboratorio no está disponible este día'],
        };
      }

      // 2. Verificar si está dentro del horario de funcionamiento
      const horaInicio = fechaInicio.split('T')[1]?.substring(0, 5);
      const horaFin = fechaFin.split('T')[1]?.substring(0, 5);

      if (horaInicio < horarioLab.horaInicio || horaFin > horarioLab.horaFin) {
        return {
          tieneConflictos: true,
          conflictos: [
            `El horario solicitado (${horaInicio} - ${horaFin}) está fuera del horario de funcionamiento (${horarioLab.horaInicio} - ${horarioLab.horaFin})`
          ],
        };
      }

      // 3. Verificar reservas que se solapan
      let query = supabase
        .from('solicitud')
        .select('id, fecha_hora_inicio, fecha_hora_fin, usuario_id')
        .eq('laboratorio_id', laboratorioId)
        .eq('estado', 'aprobada')
        .or(`and(fecha_hora_inicio.lte.${fechaFin},fecha_hora_fin.gte.${fechaInicio})`);

      if (excluirSolicitudId) {
        query = query.neq('id', excluirSolicitudId);
      }

      const { data: reservasSolapadas } = await query;

      if (reservasSolapadas && reservasSolapadas.length > 0) {
        return {
          tieneConflictos: true,
          conflictos: [
            `Ya existe ${reservasSolapadas.length} reserva(s) en este horario`
          ],
          reservasConflictivas: reservasSolapadas,
        };
      }

      return {
        tieneConflictos: false,
        conflictos: [],
      };
    },
    enabled: !!laboratorioId && !!fechaInicio && !!fechaFin,
  });
}