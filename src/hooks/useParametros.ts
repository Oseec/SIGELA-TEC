import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useParametros = () => {
  const queryClient = useQueryClient();

  // === 1. Leer parámetros ===
  const parametros = useQuery({
    queryKey: ["parametros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parametro")
        .select("clave, valor");

      if (error) throw error;

      const obj: Record<string, any> = {};

      data.forEach((p) => {
        // Intentar parsear JSON (para listas como estados)
        try {
          obj[p.clave] = JSON.parse(p.valor);
        } catch {
          obj[p.clave] = p.valor;
        }
      });

      return obj;
    },
  });

  // === 2. Modificar un parámetro ===
  const updateParametro = useMutation({
    mutationFn: async ({
      clave,
      valor,
    }: {
      clave: string;
      valor: string | number | boolean | any[];
    }) => {
      const processedValue =
        typeof valor === "object" ? JSON.stringify(valor) : String(valor);

      const { error } = await supabase
        .from("parametro")
        .update({ valor: processedValue })
        .eq("clave", clave);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parametros"] });
    },
  });

  return { parametros, updateParametro };
};
