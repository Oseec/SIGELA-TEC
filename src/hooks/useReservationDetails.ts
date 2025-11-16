import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useReservationDetails = (id: string | number) => {
  return useQuery({
    queryKey: ["reservation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solicitud")
        .select(`
          id,
          fecha_hora_inicio,
          fecha_hora_fin,
          motivo,
          estado,
          creado_en,
          documentos,
          motivo_rechazo,
          aprobado_por,

          perfil_usuario:usuario_id (
            id,
            nombre_completo
          ),

          laboratorio:laboratorio_id (
            id,
            nombre
          ),

          recursos_solicitados
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Supabase devuelve JSON ya parseado:
      const recursos = data.recursos_solicitados ?? [];

      // Sacar IDs para buscar nombres reales
      const recursoIds = recursos.map((r: any) => r.recurso_id);

      let recursosInfo = [];
      if (recursoIds.length > 0) {
        const { data: recursosDB } = await supabase
          .from("recurso")
          .select("id, nombre")
          .in("id", recursoIds);

        recursosInfo = recursos.map((r: any) => ({
          id: r.recurso_id,
          cantidad: r.cantidad,
          nombre: recursosDB?.find(x => x.id === r.recurso_id)?.nombre ?? "Recurso desconocido"
        }));
      }

      return {
        ...data,
        recursos: recursosInfo,
      };
    },
  });
};
