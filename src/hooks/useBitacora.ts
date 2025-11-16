import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useBitacora = ({ userFilter, moduleFilter }: any) => {
  return useQuery({
    queryKey: ["bitacora", userFilter, moduleFilter],
    queryFn: async () => {
      let query = supabase
        .from("bitacora")
        .select(`
          id,
          accion,
          tabla_afectada,
          registro_id,
          detalles,
          fecha_hora,
          perfil_usuario:usuario_id (
            id,
            nombre_completo,
            rol
          )
        `)
        .order("fecha_hora", { ascending: false });

      // ---- FILTRO POR MÓDULO ----
      if (moduleFilter !== "all") {
        query = query.eq("tabla_afectada", moduleFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // ---- FILTRO POR USUARIO ----
      if (userFilter !== "all") {
        return data.filter((row) => {
          // Si no tiene perfil_usuario, descartarlo
          if (!row.perfil_usuario) return false;

          return row.perfil_usuario.rol === userFilter;
        });
      }

      return data;
    },
  });
};
