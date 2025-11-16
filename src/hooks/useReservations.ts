import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner"; // o donde tengas tu toast

export const useReservations = () => {
  const queryClient = useQueryClient();

  // ============================
  //  GET RESERVAS
  // ============================
  const { data, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solicitud")
        .select(`
          id,
          fecha_hora_inicio,
          fecha_hora_fin,
          estado,
          motivo,
          creado_en,
          laboratorio:laboratorio_id (nombre),
          usuario:usuario_id (nombre_completo)
        `)
        .order("fecha_hora_inicio", { ascending: false });

      if (error) throw error;

      const map = data.map((r) => ({
        id: r.id,
        lab: r.laboratorio?.nombre ?? "Sin laboratorio",
        code: "", // si luego agregas un código interno se llena aquí
        date: r.fecha_hora_inicio.split("T")[0],
        time:
          r.fecha_hora_inicio.substring(11, 16) +
          " - " +
          r.fecha_hora_fin.substring(11, 16),
        purpose: r.motivo ?? "",
        equipment: null, // cuando agregues recursos se llena
        estado: r.estado.toLowerCase(),
        requestDate: r.creado_en.split("T")[0],
      }));

      return {
        pending: map.filter((r) => r.estado === "pendiente"),
        approved: map.filter((r) => r.estado === "aprobada"),
        rejected: map.filter((r) => r.estado === "rechazada"),
        canceled: map.filter((r) => r.estado === "cancelada"),
        inReview: map.filter((r) => r.estado === "en_revision"),

        // esto es importante para detalles / listados
        all: map,
      };
    },
  });

  // ============================
  //  CANCELAR RESERVA
  // ============================
  const cancelReservation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("solicitud")
        .update({
          estado: "cancelada",
          motivo_rechazo: "Cancelada por un administrador",
        })
        .eq("id", id);

      if (error) throw error;
    },

    onSuccess: () => {
      toast.success("Reserva cancelada.");
    },

    onError: () => {
      toast.error("Error al cancelar la reserva.");
    },
  });

  return {
    data,
    isLoading,
    cancelReservation,
  };
};
