import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useMaintenance = () => {
  return useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mantenimiento")
        .select(`
          id,
          tipo,
          fecha_programada,
          fecha_realizada,
          detalles,
          estado_final,

          recurso:recurso_id (
            id,
            nombre,
            laboratorio_id
          ),

          perfil_usuario:tecnico_id (
            id,
            nombre_completo
          )
        `)
        .order("fecha_programada", { ascending: true });

      if (error) throw error;

      // Obtener laboratorios si existen
      const laboratorioIds = [
        ...new Set(data.map((m) => m.recurso?.laboratorio_id).filter(Boolean)),
      ];

      let labsMap: Record<number, string> = {};

      if (laboratorioIds.length > 0) {
        const { data: labs } = await supabase
          .from("laboratorio")
          .select("id, nombre")
          .in("id", laboratorioIds);

        labsMap = Object.fromEntries(labs.map((l) => [l.id, l.nombre]));
      }

      return data.map((m) => ({
        id: m.id,
        tipo: m.tipo,
        date: m.fecha_programada,
        dateReal: m.fecha_realizada,
        details: m.detalles,
        finishedState: m.estado_final,

        equipment: m.recurso?.nombre ?? "Recurso desconocido",

        lab: m.recurso?.laboratorio_id
          ? labsMap[m.recurso.laboratorio_id]
          : "Laboratorio no asignado",

        technician: m.tecnico?.nombre_completo ?? "Sin técnico asignado",
      }));
    },
  });
};
