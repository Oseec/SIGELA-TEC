// src/hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface DashboardStats {
  laboratoriosActivos: number;
  reservasActivas: number;
  equiposDisponibles: number;
  mantenimientosPendientes: number;
}

export interface DashboardReservation {
  id: number;
  lab: string;
  user: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

export interface DashboardMaintenance {
  id: number;
  equipment: string;
  lab: string;
  date: string;
  type: string;
}

export const useDashboard = () => {
  // === 1. STATS PRINCIPALES ===
  const stats = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Labs activos
      const { data: labs, error: labsErr } = await supabase
        .from("laboratorio")
        .select("id", { count: "exact" });

      if (labsErr) throw labsErr;

      // Reservas activas
      const { data: reservas, error: reservasErr } = await supabase
        .from("solicitud")
        .select("id", { count: "exact" });

      if (reservasErr) throw reservasErr;

      // Equipos disponibles
      const { data: equipos, error: equiposErr } = await supabase
        .from("recurso")
        .select("cantidad_total, estado");

      if (equiposErr) throw equiposErr;

      const activos = labs.filter(l => l.horario_laboratorio.length > 0).length;

      const equiposDisponibles = equipos
        .filter((r) => r.estado === "disponible")
        .reduce((sum, r) => sum + r.cantidad_total, 0);

      // Mantenimientos pendientes
      const { data: mants, error: mantErr } = await supabase
        .from("mantenimiento")
        .select("id", { count: "exact" })
        .gte("fecha_programada", new Date().toISOString().slice(0, 10));

      if (mantErr) throw mantErr;

      return {
        laboratoriosActivos: labs?.length ?? 0,
        reservasActivas: reservas?.length ?? 0,
        equiposDisponibles,
        mantenimientosPendientes: mants?.length ?? 0,
      };
    },
  });

  // === 2. RESERVAS RECIENTES ===
  const recentReservations = useQuery({
    queryKey: ["dashboard-recent-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solicitud")
        .select(
          `
            id,
            fecha_hora_inicio,
            fecha_hora_fin,
            estado,
            laboratorio: laboratorio_id (nombre),
            usuario: usuario_id (nombre_completo)
          `
        )
        .order("creado_en", { ascending: false })
        .limit(3);

      if (error) throw error;

      function formatTime(ts: string) {
        return ts.split("T")[1].substring(0, 5); // "14:00"
      }

      function formatDate(ts: string) {
        return ts.split("T")[0]; // "2025-11-05"
      }

      return data.map((r) => ({
        id: r.id,
        lab: r.laboratorio.nombre,
        user: r.usuario.nombre_completo,

        fecha: formatDate(r.fecha_hora_inicio),
        horaInicio: formatTime(r.fecha_hora_inicio),
        horaFin: formatTime(r.fecha_hora_fin),

        estado: r.estado
      }));
    },
  });

  // === 3. MANTENIMIENTOS PRÓXIMOS ===
  const upcomingMaintenance = useQuery({
    queryKey: ["dashboard-maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mantenimiento")
        .select(
          `
          id,
          fecha_programada,
          tipo,
          recurso: recurso_id (nombre, laboratorio: laboratorio_id (nombre))
        `
        )
        .gte("fecha_programada", new Date().toISOString().slice(0, 10))
        .order("fecha_programada", { ascending: true })
        .limit(3);

      if (error) throw error;

      return data.map((m) => ({
        id: m.id,
        equipment: m.recurso.nombre,
        lab: m.recurso.laboratorio.nombre,
        date: m.fecha_programada,
        type: m.tipo,
      }));
    },
  });

  return {
    stats,
    recentReservations,
    upcomingMaintenance,
  };
};
