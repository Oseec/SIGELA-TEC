import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Plus, X } from "lucide-react";

import { useParametros } from "@/hooks/useParametros";
import { supabase } from "@/lib/supabaseClient";

export default function Settings() {
  const { parametros, updateParametro } = useParametros();
  const [user, setUser] = useState<any>(null);

  // Estado local editable
  const [localData, setLocalData] = useState<any>(null);

  // Nuevo valor para agregar etiquetas
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    loadUser();
  }, []);

  // Cuando carguen parámetros, clonar a estado local
  useEffect(() => {
    if (parametros.data) {
      setLocalData({ ...parametros.data });
    }
  }, [parametros.data]);

  if (parametros.isLoading || !localData) return <p>Cargando...</p>;

  // ---- GUARDAR CAMBIOS ----
  const handleSave = async (clave: string, valor: any) => {
    try {
      await updateParametro.mutateAsync({ clave, valor });

      await supabase.from("bitacora").insert({
        usuario_id: user?.id ?? null,
        accion: `Modificó el parámetro "${clave}"`,
        tabla_afectada: "parametro",
        detalles: { nuevoValor: valor },
      });

      alert("Cambios guardados");
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    }
  };

  // ---- AGREGAR ETIQUETA ----
  const agregarEtiqueta = (tipo: "reserva" | "equipo") => {
    if (!nuevaEtiqueta.trim()) return;

    const key = tipo === "reserva" ? "estados_reserva" : "estados_equipo";

    const actualizado = [...localData[key], nuevaEtiqueta];

    setLocalData({ ...localData, [key]: actualizado });

    setNuevaEtiqueta("");
    handleSave(key, actualizado);
  };

  // ---- ELIMINAR ETIQUETA ----
  const eliminarEtiqueta = (tipo: "reserva" | "equipo", etiqueta: string) => {
    const key = tipo === "reserva" ? "estados_reserva" : "estados_equipo";

    const actualizado = localData[key].filter((e: string) => e !== etiqueta);

    setLocalData({ ...localData, [key]: actualizado });

    handleSave(key, actualizado);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">

      <h1 className="text-3xl font-bold mb-2">Configuración de Parámetros Globales</h1>

      {/* ===== REGLAS DE RESERVA ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Reglas de Reserva
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Duración máxima */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Duración máxima por reserva</Label>
              <Input
                type="number"
                value={localData.reserva_duracion_maxima_dias}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    reserva_duracion_maxima_dias: Number(e.target.value),
                  })
                }
                className="w-28"
              />
            </div>

            <Button
              onClick={() =>
                handleSave("reserva_duracion_maxima_dias", localData.reserva_duracion_maxima_dias)
              }
            >
              Guardar
            </Button>
          </div>

          {/* Antelación mínima */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Antelación mínima</Label>
              <Input
                type="number"
                value={localData.reserva_antelacion_minima_horas}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    reserva_antelacion_minima_horas: Number(e.target.value),
                  })
                }
                className="w-28"
              />
            </div>

            <Button
              onClick={() =>
                handleSave("reserva_antelacion_minima_horas", localData.reserva_antelacion_minima_horas)
              }
            >
              Guardar
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* ===== ETIQUETAS ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Estados y Etiquetas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Estados de reserva */}
          <Label>Estados de reserva</Label>
          <div className="flex flex-wrap gap-2 items-center">
            {localData.estados_reserva.map((e: string) => (
              <Badge key={e} variant="outline" className="flex items-center gap-2">
                {e}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => eliminarEtiqueta("reserva", e)}
                />
              </Badge>
            ))}
          </div>

          {/* Agregar nueva etiqueta */}
          <div className="flex gap-2">
            <Input
              placeholder="Nueva etiqueta"
              value={nuevaEtiqueta}
              onChange={(e) => setNuevaEtiqueta(e.target.value)}
            />
            <Button onClick={() => agregarEtiqueta("reserva")}>
              <Plus className="w-4 h-4 mr-1" /> Agregar
            </Button>
          </div>

          <hr className="my-4" />

          {/* Estados de equipo */}
          <Label>Estados de equipo</Label>
          <div className="flex flex-wrap gap-2 items-center">
            {localData.estados_equipo.map((e: string) => (
              <Badge key={e} variant="outline" className="flex items-center gap-2">
                {e}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => eliminarEtiqueta("equipo", e)}
                />
              </Badge>
            ))}
          </div>

          {/* Agregar etiqueta equipo */}
          <div className="flex gap-2">
            <Input
              placeholder="Nueva etiqueta"
              value={nuevaEtiqueta}
              onChange={(e) => setNuevaEtiqueta(e.target.value)}
            />
            <Button onClick={() => agregarEtiqueta("equipo")}>
              <Plus className="w-4 h-4 mr-1" /> Agregar
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* ===== NOTIFICACIONES ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Recordatorios */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Recordatorios de entrega</Label>
            </div>

            <Switch
              checked={localData.notificaciones_recordatorios === true}
              onCheckedChange={(val) =>
                setLocalData({ ...localData, notificaciones_recordatorios: val })
              }
            />

            <Button
              onClick={() =>
                handleSave("notificaciones_recordatorios", localData.notificaciones_recordatorios)
              }
            >
              Guardar
            </Button>
          </div>

          {/* Mantenimiento */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Alertas de mantenimiento</Label>
            </div>

            <Switch
              checked={localData.notificaciones_mantenimiento === true}
              onCheckedChange={(val) =>
                setLocalData({ ...localData, notificaciones_mantenimiento: val })
              }
            />

            <Button
              onClick={() =>
                handleSave("notificaciones_mantenimiento", localData.notificaciones_mantenimiento)
              }
            >
              Guardar
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
