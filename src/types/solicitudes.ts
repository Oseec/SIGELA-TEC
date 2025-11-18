// src/types/solicitudes.ts

export type EstadoSolicitud = 
  | 'pendiente' 
  | 'aprobada' 
  | 'rechazada' 
  | 'cancelada' 
  | 'completada';

export interface Solicitud {
  solicitud_id: number;
  recurso_id: number;
  recurso_nombre: string;
  laboratorio_id: number;
  laboratorio_nombre: string;
  laboratorio_ubicacion: string | null;
  estado_solicitud: EstadoSolicitud;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  fecha_solicitud: string;
  fecha_aprobacion: string | null;
  fecha_rechazo: string | null;
  motivo_rechazo: string | null;
  aprobado_por_nombre: string | null;
  cantidad_solicitada: number;
  observaciones: string | null;
}