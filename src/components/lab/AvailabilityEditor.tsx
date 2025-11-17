// src/components/lab/AvailabilityEditor.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useLabAdmin } from "@/hooks/useLabAdmin";
import { useQueryClient } from "@tanstack/react-query";

const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

export default function AvailabilityEditor() {
  const { laboratorio } = useLabAdmin();
  const queryClient = useQueryClient();
  const [horarios, setHorarios] = useState<Record<string, { inicio: string; fin: string }>>(
    dias.reduce((acc, dia) => ({ ...acc, [dia]: { inicio: "08:00", fin: "18:00" } }), {})
  );

  const guardarHorarios = async () => {
    const data = Object.entries(horarios).flatMap(([dia, { inicio, fin }]) =>
      inicio && fin ? [{ laboratorio_id: laboratorio!.id, dia_semana: dia, hora_inicio: inicio, hora_fin: fin }] : []
    );

    await supabase.from("horario_laboratorio").delete().eq("laboratorio_id", laboratorio!.id);
    await supabase.from("horario_laboratorio").insert(data);

    queryClient.invalidateQueries({ queryKey: ["horarios"] });
    alert("Horarios guardados correctamente");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Horarios de Disponibilidad Recurrente</h3>
      {dias.map((dia) => (
        <div key={dia} className="flex items-center gap-4">
          <span className="w-24 capitalize">{dia}</span>
          <input
            type="time"
            value={horarios[dia].inicio}
            onChange={(e) => setHorarios({ ...horarios, [dia]: { ...horarios[dia], inicio: e.target.value } })}
            className="border rounded px-3 py-2"
          />
          <span>a</span>
          <input
            type="time"
            value={horarios[dia].fin}
            onChange={(e) => setHorarios({ ...horarios, [dia]: { ...horarios[dia], fin: e.target.value } })}
            className="border rounded px-3 py-2"
          />
        </div>
      ))}
      <Button onClick={guardarHorarios}>Guardar Horarios Recurrentes</Button>
    </div>
  );
}