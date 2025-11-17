import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type DisponibilidadBloque = {
  fecha: string;       // YYYY-MM-DD
  hora_inicio: string; // HH:MM:SS
  hora_fin: string;    // HH:MM:SS
  estado: "libre" | "ocupado" | "mantenimiento";
  recurso_nombre?: string | null;
};

type Laboratorio = {
  id: string;
  nombre: string;
};

type Recurso = {
  id: string;
  nombre: string;
};

// horas de los bloques que queremos mostrar siempre
const HORAS_BLOQUES = ["08:00", "10:00", "12:00", "14:00", "16:00"];

export default function CalendarAvailabilityView() {
  const [vistaActual, setVistaActual] = useState<"semanal" | "mensual">(
    "semanal"
  );
  const [fechaBase, setFechaBase] = useState(new Date());

  const [laboratorioSeleccionado, setLaboratorioSeleccionado] =
    useState<string>("todos");
  const [recursoSeleccionado, setRecursoSeleccionado] =
    useState<string>("todos");

  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadBloque[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // Cargar laboratorios y recursos desde la DB
  useEffect(() => {
    const cargarCatalogos = async () => {
      const [labsRes, recsRes] = await Promise.all([
        supabase.from("laboratorio").select("id, nombre"),
        supabase.from("recurso").select("id, nombre"),
      ]);

      if (!labsRes.error && labsRes.data) {
        setLaboratorios(
          labsRes.data.map((l: any) => ({
            id: String(l.id),
            nombre: l.nombre,
          }))
        );
      } else {
        console.error("Error cargando laboratorios:", labsRes.error);
      }

      if (!recsRes.error && recsRes.data) {
        setRecursos(
          recsRes.data.map((r: any) => ({
            id: String(r.id),
            nombre: r.nombre,
          }))
        );
      } else {
        console.error("Error cargando recursos:", recsRes.error);
      }
    };

    cargarCatalogos();
  }, []);

  // Navegación de semanas / bloques de 30 días
  const navegarSemana = (direccion: "anterior" | "siguiente") => {
    const nuevaFecha = new Date(fechaBase);
    const dias = vistaActual === "semanal" ? 7 : 30;
    nuevaFecha.setDate(
      nuevaFecha.getDate() + (direccion === "siguiente" ? dias : -dias)
    );
    setFechaBase(nuevaFecha);
  };

  const obtenerDiasSemana = () => {
    const dias: Date[] = [];
    const inicio = new Date(fechaBase);
    // inicio de semana en domingo
    inicio.setDate(inicio.getDate() - inicio.getDay());

    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }

    return dias;
  };

  const obtenerDiasMes = () => {
    const dias: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const dia = new Date(fechaBase);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const obtenerBloquesPorDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split("T")[0];
    return disponibilidad.filter((b) => b.fecha === fechaStr);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "libre":
        return "bg-green-100 border-green-300 hover:bg-green-200";
      case "ocupado":
        return "bg-red-100 border-red-300 hover:bg-red-200";
      case "mantenimiento":
        return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const formatearMesAnio = (fecha: Date) => {
    return fecha.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  // Cargar disponibilidad desde el backend (RPC)
  useEffect(() => {
    const cargarDisponibilidad = async () => {
      setLoading(true);

      let fechaInicio: Date;
      let fechaFin: Date;

      if (vistaActual === "semanal") {
        fechaInicio = new Date(fechaBase);
        fechaInicio.setDate(fechaInicio.getDate() - fechaInicio.getDay());

        fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 6);
      } else {
        fechaInicio = new Date(fechaBase);
        fechaFin = new Date(fechaBase);
        fechaFin.setDate(fechaFin.getDate() + 29);
      }

      const p_fecha_inicio = fechaInicio.toISOString().split("T")[0];
      const p_fecha_fin = fechaFin.toISOString().split("T")[0];

      const rpcParams: Record<string, any> = {
        p_fecha_inicio,
        p_fecha_fin,
      };

      if (laboratorioSeleccionado !== "todos") {
        rpcParams.p_laboratorio_id = Number(laboratorioSeleccionado);
      }

      if (recursoSeleccionado !== "todos") {
        rpcParams.p_recurso_id = Number(recursoSeleccionado);
      }

      const { data, error } = await supabase.rpc(
        "obtener_disponibilidad_bloques",
        rpcParams
      );

      if (error) {
        console.error("Error obteniendo disponibilidad:", error);
        setDisponibilidad([]);
      } else {
        setDisponibilidad((data ?? []) as DisponibilidadBloque[]);
      }

      setLoading(false);
    };

    cargarDisponibilidad();
  }, [vistaActual, fechaBase, laboratorioSeleccionado, recursoSeleccionado]);

  return (
    <div className="space-y-4">
      {/* Controles superiores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Vista de Disponibilidad
              </CardTitle>
              <CardDescription>
                Consulta los horarios libres y ocupados para planificar tus
                reservas
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={vistaActual === "semanal" ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaActual("semanal")}
              >
                Semanal
              </Button>
              <Button
                variant={vistaActual === "mensual" ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaActual("mensual")}
              >
                Mensual
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Laboratorio
              </label>
              <Select
                value={laboratorioSeleccionado}
                onValueChange={setLaboratorioSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un laboratorio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    Todos los laboratorios
                  </SelectItem>
                  {laboratorios.map((lab) => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Recurso
              </label>
              <Select
                value={recursoSeleccionado}
                onValueChange={setRecursoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un recurso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    Todos los recursos
                  </SelectItem>
                  {recursos.map((rec) => (
                    <SelectItem key={rec.id} value={rec.id}>
                      {rec.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Navegación de fechas */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarSemana("anterior")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="font-semibold">
              {formatearMesAnio(fechaBase)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarSemana("siguiente")}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Leyenda */}
          <div className="flex gap-4 justify-center text-sm border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
              <span>Libre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
              <span>Mantenimiento</span>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Cargando...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vista Semanal */}
      {vistaActual === "semanal" && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {obtenerDiasSemana().map((dia, idx) => {
                const bloquesDia = obtenerBloquesPorDia(dia);
                const esHoy =
                  dia.toDateString() === new Date().toDateString();

                return (
                  <div key={idx} className="space-y-2">
                    <div
                      className={`text-center p-2 rounded-t-lg border-b-2 ${
                        esHoy
                          ? "bg-primary text-primary-foreground font-bold"
                          : "bg-muted"
                      }`}
                    >
                      <div className="text-xs font-medium uppercase">
                        {dia.toLocaleDateString("es-ES", {
                          weekday: "short",
                        })}
                      </div>
                      <div className="text-lg font-bold">{dia.getDate()}</div>
                    </div>

                    <div className="space-y-1">
                      {HORAS_BLOQUES.map((hora) => {
                        const bloque =
                          bloquesDia.find(
                            (b) => b.hora_inicio.slice(0, 5) === hora
                          ) || null;
                        const estado = bloque?.estado ?? "libre";
                        const label =
                          estado === "ocupado"
                            ? "Ocupado"
                            : estado === "mantenimiento"
                            ? "Mant."
                            : "Libre";

                        return (
                          <button
                            key={hora}
                            className={`w-full p-2 text-xs rounded border transition-colors ${getEstadoColor(
                              estado
                            )}`}
                            title={`${hora} (${label})`}
                          >
                            <div className="font-medium">{hora}</div>
                            <div className="text-[10px] opacity-75">
                              {label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista Mensual */}
      {vistaActual === "mensual" && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {obtenerDiasMes().slice(0, 28).map((dia, idx) => {
                const bloques = obtenerBloquesPorDia(dia);
                const libres = bloques.filter(
                  (b) => b.estado === "libre"
                ).length;
                const ocupados = bloques.filter(
                  (b) => b.estado === "ocupado"
                ).length;
                const mantenimiento = bloques.filter(
                  (b) => b.estado === "mantenimiento"
                ).length;
                const esHoy =
                  dia.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={idx}
                    className={`p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                      esHoy ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        esHoy ? "text-primary" : ""
                      }`}
                    >
                      {dia.getDate()}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{libres}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span>{ocupados}</span>
                      </div>
                      {mantenimiento > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span>{mantenimiento}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
