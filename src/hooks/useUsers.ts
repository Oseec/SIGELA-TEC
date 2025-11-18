import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useUsers = (searchTerm = "") =>
  useQuery({
    queryKey: ["users", searchTerm],
    queryFn: async () => {
      let query = supabase.from("vw_usuarios").select("*");

      if (searchTerm.trim() !== "") {
        query = query.ilike("nombre_completo", `%${searchTerm}%`);
      }

      const { data, error } = await query.order("nombre_completo", { ascending: true });

      if (error) throw error;

      return data ?? [];
    },
  });
