import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useUserMetrics = () => {
  return useQuery({
    queryKey: ["user-metrics"],
    queryFn: async () => {
      // 1. Usuarios activos
      const { count: usuariosActivos } = await supabase
        .from("perfil_usuario")
        .select("*", { count: "exact", head: true })
        .eq("estado", "activo");

      // 2. Reservas totales
      const { count: totalReservas } = await supabase
        .from("solicitud")
        .select("*", { count: "exact", head: true });

      // 3. Mantenimientos activos (los que no tienen fecha_realizada)
      const { count: mantenimientosActivos } = await supabase
        .from("mantenimiento")
        .select("*", { count: "exact", head: true })
        .is("fecha_realizada", null);

      // 4. Utilización global (reservas activas hoy)
      const hoy = new Date().toISOString().split("T")[0];

      const { count: reservasHoy } = await supabase
        .from("solicitud")
        .select("*", { count: "exact", head: true })
        .gte("fecha_hora_inicio", `${hoy} 00:00`)
        .lte("fecha_hora_fin", `${hoy} 23:59`);

      const utilizacion = reservasHoy && usuariosActivos  
        ? Math.round((reservasHoy / usuariosActivos) * 100)
        : 0;

      return {
        usuariosActivos,
        totalReservas,
        mantenimientosActivos,
        utilizacion,
      };
    },
  });
};
