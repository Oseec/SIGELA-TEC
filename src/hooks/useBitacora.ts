import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

/**
 * useBitacora: trae filas paginadas + total real.
 * - userFilter: 'all' | 'admin' | 'docente' | ...
 * - moduleFilter: 'all' | 'solicitud' | 'recurso' | ...
 * - page: 1-based
 * - limit: filas por página
 */
export const useBitacora = ({ userFilter, moduleFilter, page = 1, limit = 5 }) => {
  return useQuery({
    queryKey: ["bitacora", userFilter, moduleFilter, page, limit],
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // ---------- 1) construir filtros comunes ----------
      // Nota: cuando userFilter !== 'all' usaremos !inner para poder filtrar por perfil_usuario.rol
      // Cuando userFilter === 'all' NO usamos !inner para incluir bitacoras con usuario_id = null.
      const needsInner = userFilter !== "all";

      // Construir select para datos (sin !inner aquí, lo añadiremos dinámicamente si hace falta)
      const baseSelect = `
        id,
        accion,
        tabla_afectada,
        registro_id,
        detalles,
        fecha_hora,
        perfil_usuario:usuario_id${needsInner ? "!inner" : ""} (
          id,
          nombre_completo,
          rol
        )
      `;

      // ---------- 2) contar TOTAL (misma lógica de filtros) ----------
      // Hacemos una query "head" solo para obtener count (más fiable)
      let countQuery = supabase
        .from("bitacora")
        .select("id", { count: "exact", head: true });

      // aplicar filtro por módulo si corresponde
      if (moduleFilter !== "all") {
        countQuery = countQuery.eq("tabla_afectada", moduleFilter);
      }

      // aplicar filtro por rol si corresponde (necesita !inner)
      if (userFilter !== "all") {
        // para count debemos usar el join + filter; PostgREST soporta esto con the relationship path
        // Al usar select("id", { head: true }) no se puede incluir el relationship en select,
        // por eso usamos select("id", { count: 'exact' }) pero con .filter sobre la relación vía rpc path:
        // la forma más robusta es hacer un join implícito consultando perfil_usuario directamente:
        // (vamos a consultar la tabla perfil_usuario para ids que cumplan el rol y usar in())
        const { data: perfiles, error: perfilesErr } = await supabase
          .from("perfil_usuario")
          .select("id")
          .eq("rol", userFilter);
        if (perfilesErr) throw perfilesErr;

        const ids = perfiles.map(p => p.id);
        if (ids.length === 0) {
          // no hay usuarios con ese rol -> total = 0
          return { rows: [], total: 0 };
        }
        countQuery = countQuery.in("usuario_id", ids);
      }

      // aplicar módulo filter si no aplicado (already done above)
      if (moduleFilter !== "all") {
        // already applied above
      }

      const { error: countErr, status: countStatus, count } = await countQuery;
      if (countErr && countStatus !== 406) throw countErr; // 406 puede ocurrir con head queries en algunos casos

      const total = typeof count === "number" ? count : 0;

      // ---------- 3) traer filas paginadas (misma lógica de filtros) ----------
      let dataQuery = supabase
        .from("bitacora")
        .select(baseSelect, { count: "exact" }) // count aquí sirve como respaldo pero ya tenemos total
        .order("fecha_hora", { ascending: false })
        .range(from, to);

      if (moduleFilter !== "all") {
        dataQuery = dataQuery.eq("tabla_afectada", moduleFilter);
      }

      if (userFilter !== "all") {
        // en lugar de depender de filtros en joins, reutilizamos el set de ids de perfil calculado arriba
        // para ser consistentes:
        const { data: perfiles, error: perfilesErr } = await supabase
          .from("perfil_usuario")
          .select("id")
          .eq("rol", userFilter);
        if (perfilesErr) throw perfilesErr;

        const ids = perfiles.map(p => p.id);
        if (ids.length === 0) {
          return { rows: [], total: 0 };
        }
        dataQuery = dataQuery.in("usuario_id", ids);
      }

      const { data, error } = await dataQuery;
      if (error) throw error;

      return {
        rows: data ?? [],
        total,
      };
    },
    // re-fetch cuando cambian filtros o página
    keepPreviousData: true,
  });
};
