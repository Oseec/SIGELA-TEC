// src/components/lab/LabHistory.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  Package,
  Wrench,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useLabAdmin, BitacoraEntry, TipoActividad } from "@/hooks/useLabAdmin";

// Alias local para mantener el nombre que usa el componente
type EntradaHistorial = BitacoraEntry;

export default function LabHistory() {
  const { bitacora } = useLabAdmin();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // // Mock data para desarrollo (reemplazar con bitacora real)
  // const mockHistorial: EntradaHistorial[] = [
  //   {
  //     id: 1,
  //     fecha_hora: "2024-11-17T10:30:00",
  //     tipo_actividad: "reserva_aprobada",
  //     usuario_id: "user1",
  //     nombre_usuario: "María González",
  //     accion: "Aprobó solicitud de Osciloscopio Digital",
  //     detalles: "Fecha de uso: 2024-11-20, Horario: 14:00-16:00",
  //     recurso_afectado: "Osciloscopio Digital",
  //   },
  //   {
  //     id: 2,
  //     fecha_hora: "2024-11-17T09:15:00",
  //     tipo_actividad: "recurso_entregado",
  //     usuario_id: "user2",
  //     nombre_usuario: "Carlos Ramírez",
  //     accion: "Entregó Multímetro Digital a estudiante",
  //     detalles: "Estudiante: Juan Pérez, Cantidad: 2 unidades",
  //     recurso_afectado: "Multímetro Digital",
  //   },
  //   {
  //     id: 3,
  //     fecha_hora: "2024-11-16T16:45:00",
  //     tipo_actividad: "mantenimiento_completado",
  //     usuario_id: "user3",
  //     nombre_usuario: "Ana Torres",
  //     accion: "Completó mantenimiento preventivo",
  //     detalles: "Calibración de equipos de medición. Estado: Operativo",
  //     recurso_afectado: "Generador de Funciones",
  //   },
  //   {
  //     id: 4,
  //     fecha_hora: "2024-11-16T14:20:00",
  //     tipo_actividad: "reserva_rechazada",
  //     usuario_id: "user1",
  //     nombre_usuario: "María González",
  //     accion: "Rechazó solicitud de uso de laboratorio",
  //     detalles: "Motivo: El solicitante no cumple con los requisitos de seguridad",
  //   },
  //   {
  //     id: 5,
  //     fecha_hora: "2024-11-16T11:00:00",
  //     tipo_actividad: "recurso_devuelto",
  //     usuario_id: "user4",
  //     nombre_usuario: "Pedro Martínez",
  //     accion: "Recibió devolución de Protoboard",
  //     detalles: "Estado: Bueno, Sin observaciones",
  //     recurso_afectado: "Protoboard",
  //   },
  //   {
  //     id: 6,
  //     fecha_hora: "2024-11-15T15:30:00",
  //     tipo_actividad: "politicas_actualizadas",
  //     usuario_id: "user1",
  //     nombre_usuario: "María González",
  //     accion: "Actualizó políticas del laboratorio",
  //     detalles: "Cambios en horarios y requisitos de acceso",
  //   },
  //   {
  //     id: 7,
  //     fecha_hora: "2024-11-15T10:15:00",
  //     tipo_actividad: "recurso_agregado",
  //     usuario_id: "user1",
  //     nombre_usuario: "María González",
  //     accion: "Agregó nuevo recurso al inventario",
  //     detalles: "Equipo: Fuente de Poder DC, Cantidad: 5 unidades",
  //     recurso_afectado: "Fuente de Poder DC",
  //   },
  //   {
  //     id: 8,
  //     fecha_hora: "2024-11-15T09:00:00",
  //     tipo_actividad: "reserva_creada",
  //     usuario_id: "user5",
  //     nombre_usuario: "Sistema",
  //     accion: "Nueva solicitud de reserva recibida",
  //     detalles: "Solicitante: Laura Méndez, Recurso: Osciloscopio",
  //     recurso_afectado: "Osciloscopio Digital",
  //   },
  // ];

  // // Usar mock data o bitacora real
  const historialData: EntradaHistorial[] = bitacora ?? [];

  // Función para obtener el icono según el tipo de actividad
  const getActivityIcon = (tipo: TipoActividad) => {
    switch (tipo) {
      case "reserva_creada":
      case "reserva_aprobada":
      case "reserva_completada":
        return <CheckCircle className="h-4 w-4" />;
      case "reserva_rechazada":
      case "reserva_cancelada":
        return <XCircle className="h-4 w-4" />;
      case "recurso_entregado":
      case "recurso_devuelto":
        return <Package className="h-4 w-4" />;
      case "mantenimiento_programado":
      case "mantenimiento_completado":
        return <Wrench className="h-4 w-4" />;
      case "politicas_actualizadas":
        return <FileText className="h-4 w-4" />;
      case "recurso_agregado":
      case "recurso_modificado":
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Función para obtener el color del badge según el tipo
  const getActivityColor = (tipo: TipoActividad): "default" | "secondary" | "destructive" | "outline" => {
    switch (tipo) {
      case "reserva_aprobada":
      case "reserva_completada":
      case "recurso_devuelto":
      case "mantenimiento_completado":
        return "default";
      case "reserva_creada":
      case "recurso_entregado":
      case "mantenimiento_programado":
        return "secondary";
      case "reserva_rechazada":
      case "reserva_cancelada":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Función para formatear el tipo de actividad
  const formatTipoActividad = (tipo: TipoActividad): string => {
    const formatos: Record<TipoActividad, string> = {
      reserva_creada: "Reserva Creada",
      reserva_aprobada: "Reserva Aprobada",
      reserva_rechazada: "Reserva Rechazada",
      reserva_cancelada: "Reserva Cancelada",
      reserva_completada: "Reserva Completada",
      recurso_entregado: "Recurso Entregado",
      recurso_devuelto: "Recurso Devuelto",
      mantenimiento_programado: "Mantenimiento Programado",
      mantenimiento_completado: "Mantenimiento Completado",
      politicas_actualizadas: "Políticas Actualizadas",
      recurso_agregado: "Recurso Agregado",
      recurso_modificado: "Recurso Modificado",
      otro: "Otro",
    };
    return formatos[tipo] || tipo;
  };

  // Función para formatear fecha
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const fechaSolo = date.toLocaleDateString();
    const hoyFecha = hoy.toLocaleDateString();
    const ayerFecha = ayer.toLocaleDateString();

    let prefijo = "";
    if (fechaSolo === hoyFecha) {
      prefijo = "Hoy, ";
    } else if (fechaSolo === ayerFecha) {
      prefijo = "Ayer, ";
    }

    return {
      fecha: prefijo + date.toLocaleDateString("es-ES", { 
        day: "2-digit", 
        month: "short", 
        year: date.getFullYear() !== hoy.getFullYear() ? "numeric" : undefined 
      }),
      hora: date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Toggle para expandir detalles
  const toggleExpandRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Filtrado de datos
  const historialFiltrado = useMemo(() => {
    let resultado = historialData;

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (entry) =>
          entry.nombre_usuario.toLowerCase().includes(term) ||
          entry.accion.toLowerCase().includes(term) ||
          entry.recurso_afectado?.toLowerCase().includes(term) ||
          entry.detalles?.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo
    if (tipoFiltro !== "todos") {
      resultado = resultado.filter((entry) => entry.tipo_actividad === tipoFiltro);
    }

    // Filtro por fecha desde
    if (fechaDesde) {
      resultado = resultado.filter((entry) => entry.fecha_hora >= fechaDesde);
    }

    // Filtro por fecha hasta
    if (fechaHasta) {
      resultado = resultado.filter((entry) => entry.fecha_hora <= fechaHasta + "T23:59:59");
    }

    return resultado;
  }, [historialData, searchTerm, tipoFiltro, fechaDesde, fechaHasta]);

  // Función para exportar a CSV
  const handleExportCSV = () => {
    const headers = ["Fecha", "Hora", "Usuario", "Tipo", "Acción", "Recurso", "Detalles"];
    const rows = historialFiltrado.map((entry) => {
      const { fecha, hora } = formatFecha(entry.fecha_hora);
      return [
        fecha,
        hora,
        entry.nombre_usuario,
        formatTipoActividad(entry.tipo_actividad),
        entry.accion,
        entry.recurso_afectado || "",
        entry.detalles || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `historial_laboratorio_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (historialData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial del Laboratorio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay actividad reciente</p>
            <p className="text-sm mt-2">
              Las acciones realizadas en el laboratorio aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Historial del Laboratorio
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registro completo de todas las actividades, reservas y mantenimientos
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Usuario, acción, recurso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tipo de actividad */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de actividad</label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="reserva_creada">Reserva Creada</SelectItem>
                  <SelectItem value="reserva_aprobada">Reserva Aprobada</SelectItem>
                  <SelectItem value="reserva_rechazada">Reserva Rechazada</SelectItem>
                  <SelectItem value="reserva_cancelada">Reserva Cancelada</SelectItem>
                  <SelectItem value="reserva_completada">Reserva Completada</SelectItem>
                  <SelectItem value="recurso_entregado">Recurso Entregado</SelectItem>
                  <SelectItem value="recurso_devuelto">Recurso Devuelto</SelectItem>
                  <SelectItem value="mantenimiento_programado">Mantenimiento Programado</SelectItem>
                  <SelectItem value="mantenimiento_completado">Mantenimiento Completado</SelectItem>
                  <SelectItem value="politicas_actualizadas">Políticas Actualizadas</SelectItem>
                  <SelectItem value="recurso_agregado">Recurso Agregado</SelectItem>
                  <SelectItem value="recurso_modificado">Recurso Modificado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha desde */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Desde</label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>

            {/* Fecha hasta */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hasta</label>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          {(searchTerm || tipoFiltro !== "todos" || fechaDesde || fechaHasta) && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setTipoFiltro("todos");
                  setFechaDesde("");
                  setFechaHasta("");
                }}
              >
                Limpiar filtros
              </Button>
              <span className="text-sm text-muted-foreground">
                Mostrando {historialFiltrado.length} de {historialData.length} registros
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de historial */}
      <Card>
        <CardContent className="p-0">
          {historialFiltrado.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron resultados con los filtros seleccionados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Fecha</TableHead>
                  <TableHead className="w-[80px]">Hora</TableHead>
                  <TableHead className="w-[180px]">Usuario</TableHead>
                  <TableHead className="w-[160px]">Tipo</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historialFiltrado.map((entry) => {
                  const { fecha, hora } = formatFecha(entry.fecha_hora);
                  const isExpanded = expandedRows.has(entry.id);

                  return (
                    <>
                      <TableRow 
                        key={entry.id}
                        className={isExpanded ? "border-b-0" : ""}
                      >
                        <TableCell className="font-medium">{fecha}</TableCell>
                        <TableCell className="text-muted-foreground">{hora}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm">{entry.nombre_usuario}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getActivityColor(entry.tipo_actividad)}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getActivityIcon(entry.tipo_actividad)}
                            {formatTipoActividad(entry.tipo_actividad)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div>
                            <p className="text-sm">{entry.accion}</p>
                            {entry.recurso_afectado && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Package className="h-3 w-3 inline mr-1" />
                                {entry.recurso_afectado}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.detalles && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandRow(entry.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && entry.detalles && (
                        <TableRow key={`${entry.id}-details`}>
                          <TableCell colSpan={6} className="bg-muted/50">
                            <div className="py-3 px-4">
                              <p className="text-sm font-medium mb-1">Detalles:</p>
                              <p className="text-sm text-muted-foreground">
                                {entry.detalles}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de registros</p>
                <p className="text-2xl font-bold">{historialFiltrado.length}</p>
              </div>
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reservas</p>
                <p className="text-2xl font-bold">
                  {historialFiltrado.filter((e) => 
                    e.tipo_actividad.includes("reserva")
                  ).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recursos</p>
                <p className="text-2xl font-bold">
                  {historialFiltrado.filter((e) => 
                    e.tipo_actividad.includes("recurso")
                  ).length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mantenimientos</p>
                <p className="text-2xl font-bold">
                  {historialFiltrado.filter((e) => 
                    e.tipo_actividad.includes("mantenimiento")
                  ).length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}