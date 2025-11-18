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
  XCircle,
  Download,
} from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import CalendarAvailabilityView from "@/components/CalendarAvailabilityView";
import { ReservationRequestModal, RecursoBusqueda } from "@/components/ReservationRequestModal";
import CancelReservationDialog from "@/components/CancelReservationDialog";

import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Solicitud } from "@/types/solicitudes";

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

  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [policiesData, setPoliciesData] = useState<{
    laboratorioNombre: string;
    politicas: any;
    requisitos: string[];
    cumple: boolean;
    mensaje: string;
  } | null>(null);

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

  // solicitudes del usuario
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [solicitudAEliminar, setSolicitudAEliminar] = useState<Solicitud | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [recursoSeleccionado, setRecursoSeleccionado] = useState<RecursoBusqueda | null>(null);
  const [reservarAbierto, setReservarAbierto] = useState(false);

  // Cargar solicitudes del usuario
  const cargarSolicitudes = async () => {
    if (!user) return;

    setLoadingSolicitudes(true);
    const { data, error } = await supabase.rpc("obtener_solicitudes_usuario", {
      p_usuario_id: user.id,
    });

    if (error) {
      console.error("Error cargando solicitudes:", error);
      setSolicitudes([]);
    } else {
      setSolicitudes((data ?? []) as Solicitud[]);
    }

    setLoadingSolicitudes(false);
  };

  // Cargar solicitudes al montar y cuando cambie el usuario
  useEffect(() => {
    cargarSolicitudes();
  }, [user]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('solicitudes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solicitud',
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Cambio detectado en solicitudes:', payload);
          cargarSolicitudes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleViewPolicies = async (recurso: any) => {
    if (!user) return;

    setSelectedResource(recurso);
    setPoliciesOpen(true);
    setPoliciesLoading(true);

    const { data, error } = await supabase.rpc(
      "obtener_politicas_y_requisitos",
      {
        p_usuario_id: user.id,
        p_laboratorio_id: recurso.laboratorio_id,
      }
    );

    if (error) {
      console.error("Error obteniendo políticas:", error);
      setPoliciesData({
        laboratorioNombre: recurso.laboratorio_nombre,
        politicas: null,
        requisitos: [],
        cumple: true,
        mensaje:
          "No se pudieron cargar las políticas en este momento. Intenta de nuevo más tarde.",
      });
    } else if (data && data.length > 0) {
      const row = data[0];
      setPoliciesData({
        laboratorioNombre: row.laboratorio_nombre,
        politicas: row.politicas,
        requisitos: row.requisitos_certificaciones ?? [],
        cumple: row.cumple,
        mensaje: row.mensaje,
      });
    } else {
      setPoliciesData({
        laboratorioNombre: recurso.laboratorio_nombre,
        politicas: null,
        requisitos: [],
        cumple: true,
        mensaje: "Este laboratorio no tiene requisitos registrados.",
      });
    }

    setPoliciesLoading(false);
  };

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

  // Obtener próximas reservas (aprobadas y pendientes)
  const proximasReservas = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return solicitudes
      .filter(s =>
        (s.estado_solicitud === 'aprobada' || s.estado_solicitud === 'pendiente') &&
        s.fecha_inicio >= hoy
      )
      .slice(0, 5); // Mostrar solo las 5 más próximas
  }, [solicitudes]);

  const getEstadoSolicitudLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aprobada': return 'Aprobada';
      case 'rechazada': return 'Rechazada';
      case 'cancelada': return 'Cancelada';
      case 'completada': return 'Completada';
      default: return estado;
    }
  };

  const getEstadoSolicitudVariant = (estado: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (estado) {
      case 'aprobada': return 'default';
      case 'pendiente': return 'secondary';
      case 'rechazada':
      case 'cancelada': return 'destructive';
      default: return 'outline';
    }
  };

  const handleCancelarClick = (solicitud: Solicitud) => {
    setSolicitudAEliminar(solicitud);
    setCancelDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    cargarSolicitudes(); // Recargar la lista
  };

    // Historial mock (usado en el tab de Historial y para exportar)
  const historialMock = [
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
  ];

  const handleExportHistoryToCSV = () => {
    const header = ["Recurso", "Estado", "Fecha", "Horario", "Nota"];
    const rows = historialMock.map((item) => [
      item.name,
      item.status,
      item.date,
      item.time,
      item.note,
    ]);

    const csvContent =
      [header, ...rows]
        .map((row) =>
          row
            .map((cell) => {
              const value = String(cell ?? "");
              // escapamos comillas y coma
              const escaped = value.replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historial_reservas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportHistoryToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = historialMock
      .map(
        (item) => `
        <tr>
          <td style="border:1px solid #ccc;padding:4px;">${item.name}</td>
          <td style="border:1px solid #ccc;padding:4px;">${item.status}</td>
          <td style="border:1px solid #ccc;padding:4px;">${item.date}</td>
          <td style="border:1px solid #ccc;padding:4px;">${item.time}</td>
          <td style="border:1px solid #ccc;padding:4px;">${item.note}</td>
        </tr>
      `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Historial de reservas</title>
        </head>
        <body>
          <h1>Historial de reservas</h1>
          <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:12px;">
            <thead>
              <tr>
                <th style="border:1px solid #ccc;padding:4px;">Recurso</th>
                <th style="border:1px solid #ccc;padding:4px;">Estado</th>
                <th style="border:1px solid #ccc;padding:4px;">Fecha</th>
                <th style="border:1px solid #ccc;padding:4px;">Horario</th>
                <th style="border:1px solid #ccc;padding:4px;">Nota</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };




  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ¡Bienvenido!
        </h1>
        <p className="text-muted-foreground">
          Tienes{" "}
          <span className="font-semibold text-primary">
            {proximasReservas.length} {proximasReservas.length === 1 ? 'reserva próxima' : 'reservas próximas'}
          </span>
        </p>
      </div>

      {/* Próximas reservas */}
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
          {loadingSolicitudes ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando tus solicitudes...
            </div>
          ) : proximasReservas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes reservas próximas
            </div>
          ) : (
            proximasReservas.map((solicitud) => (
              <div
                key={solicitud.solicitud_id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{solicitud.recurso_nombre}</h3>
                    <Badge variant={getEstadoSolicitudVariant(solicitud.estado_solicitud)}>
                      {getEstadoSolicitudLabel(solicitud.estado_solicitud)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {solicitud.fecha_inicio}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {solicitud.hora_inicio} - {solicitud.hora_fin}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{solicitud.laboratorio_nombre}</span>
                    {solicitud.laboratorio_ubicacion && (
                      <span className="text-muted-foreground">
                        • {solicitud.laboratorio_ubicacion}
                      </span>
                    )}
                  </div>
                  {solicitud.motivo && (
                    <p className="text-sm text-muted-foreground">
                      Motivo: {solicitud.motivo}
                    </p>
                  )}
                  {solicitud.estado_solicitud === 'aprobada' && solicitud.aprobado_por_nombre && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Aprobada por: {solicitud.aprobado_por_nombre}
                    </p>
                  )}
                  {solicitud.estado_solicitud === 'rechazada' && solicitud.motivo_rechazo && (
                    <p className="text-sm text-destructive">
                      Motivo rechazo: {solicitud.motivo_rechazo}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {/* <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button> */}
                  {solicitud.estado_solicitud === 'pendiente' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelarClick(solicitud)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
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
                      {/* Lado izquierdo: info del recurso */}
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
                        {aplicarFiltroRequisitos && r.mensaje_requisitos && (
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

                      {/* Lado derecho: ambos botones en el mismo div */}
                      <div className="mt-4 flex flex-col items-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPolicies(r)}
                        >
                          Ver requisitos
                        </Button>

                        <Button
                          disabled={
                            !isReservable(r.recurso_estado) ||
                            r.cantidad_disponible <= 0
                          }
                          onClick={() => {
                            // adaptar si tu objeto se llama distinto
                            const recurso: RecursoBusqueda = {
                              recurso_id: r.recurso_id,
                              recurso_nombre: r.recurso_nombre,
                              laboratorio_id: r.laboratorio_id,
                              laboratorio_nombre: r.laboratorio_nombre,
                              laboratorio_ubicacion: r.laboratorio_ubicacion,
                              cantidad_disponible: r.cantidad_disponible,
                            };

                            setRecursoSeleccionado(recurso);
                            setReservarAbierto(true);
                          }}
                        >
                          {isReservable(r.recurso_estado) && r.cantidad_disponible > 0
                            ? "Reservar"
                            : "No Disponible"}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Calendario */}
        <TabsContent value="calendar">
          <CalendarAvailabilityView />
        </TabsContent>

        {/* TAB: Historial (mock) */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Historial Personal</CardTitle>
                <CardDescription>
                  Historial de reservas pasadas y constancias académicas
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportHistoryToCSV}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportHistoryToPDF}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historialMock.map((item, index) => (

                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.date} • {item.time}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">{item.note}</p>
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

      {/* Diálogo de políticas y requisitos */}
      <Dialog open={policiesOpen} onOpenChange={setPoliciesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Requisitos y políticas
              {policiesData && ` · ${policiesData.laboratorioNombre}`}
            </DialogTitle>
            <DialogDescription>
              Revisa esta información antes de enviar tu solicitud.
            </DialogDescription>
          </DialogHeader>

          {policiesLoading ? (
            <div className="py-6 text-sm text-muted-foreground">
              Cargando políticas...
            </div>
          ) : policiesData ? (
            <div className="space-y-4">
              {/* Requisitos */}
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  Requisitos de acceso
                </h3>
                {policiesData.requisitos.length > 0 ? (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {policiesData.requisitos.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Este laboratorio no tiene certificaciones obligatorias
                    registradas.
                  </p>
                )}

                <div className="mt-2">
                  <Badge
                    variant={policiesData.cumple ? "outline" : "destructive"}
                    className={
                      policiesData.cumple
                        ? "border-green-500 text-green-700"
                        : undefined
                    }
                  >
                    {policiesData.cumple
                      ? "Cumples con los requisitos"
                      : "No cumples con los requisitos"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {policiesData.mensaje}
                  </p>
                </div>
              </div>

              {/* Políticas */}
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  Políticas del laboratorio
                </h3>
                {policiesData.politicas ? (
                  <pre className="text-xs bg-muted p-3 rounded-md whitespace-pre-wrap break-words">
                    {typeof policiesData.politicas === "string"
                      ? policiesData.politicas
                      : JSON.stringify(policiesData.politicas, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Este laboratorio no tiene políticas detalladas
                    registradas en el sistema.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">
              No hay información de políticas para este laboratorio.
            </p>
          )}

          <DialogFooter className="mt-4">
            <Button onClick={() => setPoliciesOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de reserva */}
      <ReservationRequestModal
        open={reservarAbierto}
        onOpenChange={setReservarAbierto}
        recurso={recursoSeleccionado}
        fechaSeleccionada={fechaFiltro}
        horaInicio={horaInicioFiltro}
        horaFin={horaFinFiltro}
        onReservationSuccess={cargarSolicitudes}
      />

      {/* Diálogo de cancelación */}
      <CancelReservationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        solicitud={solicitudAEliminar}
        onCancelSuccess={handleCancelSuccess}
      />
    </div>
  );
}