import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Calendar,
  History,
  Bell,
  Clock,
  MapPin,
} from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

type RecursoDisponible = {
  recurso_id: number;
  recurso_nombre: string;
  recurso_tipo: string;
  recurso_estado: string;
  laboratorio_id: number;
  laboratorio_nombre: string;
  laboratorio_ubicacion: string | null;
  escuela_nombre: string | null;
  cantidad_disponible: number;
  // campos opcionales cuando se usa recursos_disponibles_para_usuario
  cumple_requisitos?: boolean;
  mensaje_requisitos?: string | null;
};

export default function StudentDashboard() {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");

  const [recursos, setRecursos] = useState<RecursoDisponible[]>([]);
  const [loadingRecursos, setLoadingRecursos] = useState(false);

  // filtros
  const [laboratorioFiltro, setLaboratorioFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [ubicacionFiltro, setUbicacionFiltro] = useState<string>("todas");
  const [fechaFiltro, setFechaFiltro] = useState<string>(""); // YYYY-MM-DD
  const [horaInicioFiltro, setHoraInicioFiltro] = useState<string>(""); // HH:MM
  const [horaFinFiltro, setHoraFinFiltro] = useState<string>(""); // HH:MM

  // filtro avanzado por requisitos
  const [aplicarFiltroRequisitos, setAplicarFiltroRequisitos] =
    useState<boolean>(false);

  // reservas simuladas (por ahora)
  const upcomingReservations = [
    {
      resource: "Osciloscopio Digital",
      status: "Aprobada",
      date: "2024-03-15",
      time: "09:00 - 11:00",
      requestedBy: "Dr. García",
      location: "Lab. Física Avanzada",
    },
    {
      resource: "Generador de Funciones",
      status: "Pendiente",
      date: "2024-03-18",
      time: "13:00 - 15:00",
      requestedBy: "Investigación",
      location: "Lab. Física Avanzada",
    },
  ];

  // cargar recursos disponibles cuando cambian filtros
  useEffect(() => {
    const cargarRecursos = async () => {
      // necesitamos al menos fecha
      if (!fechaFiltro) {
        setRecursos([]);
        return;
      }

      setLoadingRecursos(true);

      const params: Record<string, any> = {
        p_fecha: fechaFiltro,
      };

      if (horaInicioFiltro) params.p_hora_inicio = horaInicioFiltro;
      if (horaFinFiltro) params.p_hora_fin = horaFinFiltro;
      if (laboratorioFiltro !== "todos") {
        params.p_laboratorio_id = Number(laboratorioFiltro);
      }
      if (tipoFiltro !== "todos") {
        params.p_tipo_recurso = tipoFiltro;
      }
      if (ubicacionFiltro !== "todas") {
        params.p_ubicacion = ubicacionFiltro;
      }

      let data: any[] | null = null;
      let error: any = null;

      // modo normal, solo criterios
      if (!aplicarFiltroRequisitos) {
        const resp = await supabase.rpc(
          "recursos_disponibles_en_rango",
          params
        );
        data = resp.data;
        error = resp.error;
      } else {
        // modo avanzado, aplica rol y requisitos usando recursos_disponibles_para_usuario
        if (!user) {
          // sin usuario no se puede aplicar este filtro
          setRecursos([]);
          setLoadingRecursos(false);
          return;
        }

        const resp = await supabase.rpc(
          "recursos_disponibles_para_usuario",
          {
            p_usuario_id: user.id,
            ...params,
          }
        );
        data = resp.data;
        error = resp.error;
      }

      if (error) {
        console.error("Error cargando recursos:", error);
        setRecursos([]);
      } else {
        setRecursos((data ?? []) as RecursoDisponible[]);
      }

      setLoadingRecursos(false);
    };

    cargarRecursos();
  }, [
    user,
    fechaFiltro,
    horaInicioFiltro,
    horaFinFiltro,
    laboratorioFiltro,
    tipoFiltro,
    ubicacionFiltro,
    aplicarFiltroRequisitos,
  ]);

  // opciones de filtros dinámicas a partir de los recursos actuales
  const laboratoriosDisponibles = useMemo(() => {
    const map = new Map<number, string>();
    recursos.forEach((r) => {
      if (!map.has(r.laboratorio_id)) {
        map.set(r.laboratorio_id, r.laboratorio_nombre);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [recursos]);

  const tiposDisponibles = useMemo(() => {
    return Array.from(new Set(recursos.map((r) => r.recurso_tipo))).filter(
      Boolean
    );
  }, [recursos]);

  const ubicacionesDisponibles = useMemo(() => {
    return Array.from(
      new Set(
        recursos
          .map((r) => r.laboratorio_ubicacion || "")
          .filter((u) => u.trim() !== "")
      )
    );
  }, [recursos]);

  // búsqueda por texto, criterios ya vienen filtrados desde el backend
  const recursosFiltrados = useMemo(() => {
    if (!searchTerm) return recursos;
    const t = searchTerm.toLowerCase();
    return recursos.filter(
      (r) =>
        r.recurso_nombre.toLowerCase().includes(t) ||
        r.laboratorio_nombre.toLowerCase().includes(t) ||
        (r.escuela_nombre ?? "").toLowerCase().includes(t)
    );
  }, [recursos, searchTerm]);

  // helpers para estado y botón
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "Disponible";
      case "reservado":
        return "Reservado";
      case "mantenimiento":
      case "en_mantenimiento":
        return "En mantenimiento";
      case "fuera_de_servicio":
      case "inactivo":
        return "No disponible";
      default:
        return estado;
    }
  };

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "default";
      case "reservado":
        return "secondary";
      default:
        return "outline";
    }
  };

  const isReservable = (estado: string) => estado === "disponible";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ¡Bienvenido!
        </h1>
        <p className="text-muted-foreground">
          Tienes{" "}
          <span className="font-semibold text-primary">
            2 reservas próximas
          </span>
        </p>
      </div>

      {/* Próximas reservas (mock por ahora) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximas Reservas
          </CardTitle>
          <CardDescription>
            Tus reservas programadas para los próximos días
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingReservations.map((reservation, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{reservation.resource}</h3>
                  <Badge
                    variant={
                      reservation.status === "Aprobada"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {reservation.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {reservation.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {reservation.time}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{reservation.location}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Solicitado por: {reservation.requestedBy}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ver Detalles
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Avisos
          </TabsTrigger>
        </TabsList>

        {/* TAB: Búsqueda de recursos */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Recursos/Laboratorios</CardTitle>
              <CardDescription>
                Filtra por laboratorio, tipo, fecha, horario y ubicación.
                Opcionalmente puedes aplicar el filtro por requisitos
                (certificaciones).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* búsqueda por texto */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipos, laboratorios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* filtros básicos: laboratorio, tipo, ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Laboratorio
                  </span>
                  <Select
                    value={laboratorioFiltro}
                    onValueChange={setLaboratorioFiltro}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los laboratorios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {laboratoriosDisponibles.map((lab) => (
                        <SelectItem
                          key={lab.id}
                          value={String(lab.id)}
                        >
                          {lab.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">
                    Tipo de recurso
                  </span>
                  <Select
                    value={tipoFiltro}
                    onValueChange={setTipoFiltro}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {tiposDisponibles.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">
                    Ubicación
                  </span>
                  <Select
                    value={ubicacionFiltro}
                    onValueChange={setUbicacionFiltro}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las ubicaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {ubicacionesDisponibles.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* filtros de fecha y horario */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Fecha
                  </span>
                  <Input
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                  />
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">
                    Hora inicio
                  </span>
                  <Input
                    type="time"
                    value={horaInicioFiltro}
                    onChange={(e) => setHoraInicioFiltro(e.target.value)}
                  />
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">
                    Hora fin
                  </span>
                  <Input
                    type="time"
                    value={horaFinFiltro}
                    onChange={(e) => setHoraFinFiltro(e.target.value)}
                  />
                </div>
              </div>

              {/* toggle de filtro por requisitos */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    aplicarFiltroRequisitos ? "default" : "outline"
                  }
                  onClick={() =>
                    setAplicarFiltroRequisitos((prev) => !prev)
                  }
                >
                  {aplicarFiltroRequisitos
                    ? "Filtro por requisitos: ACTIVADO"
                    : "Filtro por requisitos: DESACTIVADO"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Cuando está activado, solo ves recursos en laboratorios
                  donde cumples certificaciones.
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Resultados de búsqueda:</h3>

                {!fechaFiltro && (
                  <p className="text-sm text-muted-foreground">
                    Selecciona una fecha para ver los recursos disponibles.
                  </p>
                )}

                {fechaFiltro && loadingRecursos && (
                  <p className="text-sm text-muted-foreground">
                    Cargando recursos disponibles...
                  </p>
                )}

                {fechaFiltro &&
                  !loadingRecursos &&
                  recursosFiltrados.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No se encontraron recursos disponibles con los filtros
                      seleccionados
                      {aplicarFiltroRequisitos
                        ? " o no cumples los requisitos del laboratorio."
                        : "."}
                    </p>
                  )}

                {fechaFiltro &&
                  !loadingRecursos &&
                  recursosFiltrados.map((r) => (
                    <div
                      key={r.recurso_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{r.recurso_nombre}</h4>
                        <p className="text-sm text-muted-foreground">
                          {r.laboratorio_nombre}
                          {r.escuela_nombre && ` • ${r.escuela_nombre}`}
                          {r.laboratorio_ubicacion &&
                            ` • ${r.laboratorio_ubicacion}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Fecha seleccionada: {fechaFiltro}
                          {horaInicioFiltro && horaFinFiltro && (
                            <>
                              {" "}
                              • {horaInicioFiltro} - {horaFinFiltro}
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Cantidad disponible: {r.cantidad_disponible}
                        </p>
                        {aplicarFiltroRequisitos &&
                          r.mensaje_requisitos && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {r.mensaje_requisitos}
                            </p>
                          )}
                        <Badge
                          variant={getEstadoVariant(r.recurso_estado)}
                          className="mt-2"
                        >
                          {getEstadoLabel(r.recurso_estado)}
                        </Badge>
                      </div>
                      <Button
                        disabled={
                          !isReservable(r.recurso_estado) ||
                          r.cantidad_disponible <= 0
                        }
                      >
                        {isReservable(r.recurso_estado) &&
                        r.cantidad_disponible > 0
                          ? "Reservar"
                          : "No Disponible"}
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Calendario (mock) */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendario Personal</CardTitle>
              <CardDescription>
                Vista de todas tus reservas aprobadas y pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingReservations.map((reservation, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{reservation.resource}</h4>
                      <Badge
                        variant={
                          reservation.status === "Aprobada"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {reservation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {reservation.date} • {reservation.time}
                    </p>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Historial (mock) */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial Personal</CardTitle>
              <CardDescription>
                Historial de reservas pasadas y constancias académicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: "Multímetro Digital",
                    status: "Completado",
                    date: "2024-03-10",
                    time: "14:00 - 16:00",
                    note: "Devuelto exitosamente",
                  },
                  {
                    name: "Protoboard",
                    status: "Completado",
                    date: "2024-03-08",
                    time: "10:00 - 12:00",
                    note: "Devuelto exitosamente",
                  },
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.date} • {item.time}
                    </p>
                    <p className="text-sm text-success mt-1">{item.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Notificaciones (mock) */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Alertas y recordatorios importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-accent/50">
                  <p className="font-medium mb-1">
                    Su reserva para el Osciloscopio Digital ha sido
                    aprobada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hace 2 horas
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-1">
                    Recordatorio: Entrega mañana a las 11:00 AM
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hace 5 horas
                  </p>
                </div>
                <div className="p-4 text-center text-muted-foreground">
                  No hay más notificaciones
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
