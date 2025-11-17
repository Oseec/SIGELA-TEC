import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

type DisponibilidadBloque = {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: "libre" | "ocupado" | "mantenimiento";
  recurso_nombre?: string;
};

export default function CalendarAvailabilityView() {
  const [vistaActual, setVistaActual] = useState<"semanal" | "mensual">("semanal");
  const [fechaBase, setFechaBase] = useState(new Date());
  const [laboratorioSeleccionado, setLaboratorioSeleccionado] = useState<string>("todos");
  const [recursoSeleccionado, setRecursoSeleccionado] = useState<string>("todos");
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadBloque[]>([]);

  // Datos mock para demostración
  const laboratorios = [
    { id: "1", nombre: "Lab. Física Avanzada" },
    { id: "2", nombre: "Lab. Química Orgánica" },
    { id: "3", nombre: "Lab. Computación" },
  ];

  const recursos = [
    { id: "1", nombre: "Osciloscopio Digital" },
    { id: "2", nombre: "Generador de Funciones" },
    { id: "3", nombre: "Multímetro" },
  ];

  // Generar datos de disponibilidad mock
  useEffect(() => {
    const bloques: DisponibilidadBloque[] = [];
    const diasSemana = vistaActual === "semanal" ? 7 : 30;
    
    for (let i = 0; i < diasSemana; i++) {
      const fecha = new Date(fechaBase);
      fecha.setDate(fecha.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      // Generar bloques de 2 horas entre 8:00 y 18:00
      for (let hora = 8; hora < 18; hora += 2) {
        const horaInicio = `${hora.toString().padStart(2, '0')}:00`;
        const horaFin = `${(hora + 2).toString().padStart(2, '0')}:00`;
        
        // Simular disponibilidad aleatoria
        const random = Math.random();
        let estado: "libre" | "ocupado" | "mantenimiento" = "libre";
        
        if (random < 0.3) estado = "ocupado";
        else if (random < 0.4) estado = "mantenimiento";
        
        bloques.push({
          fecha: fechaStr,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          estado,
          recurso_nombre: estado === "ocupado" ? "Osciloscopio Digital" : undefined,
        });
      }
    }
    
    setDisponibilidad(bloques);
  }, [fechaBase, vistaActual, laboratorioSeleccionado, recursoSeleccionado]);

  const navegarSemana = (direccion: "anterior" | "siguiente") => {
    const nuevaFecha = new Date(fechaBase);
    const dias = vistaActual === "semanal" ? 7 : 30;
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === "siguiente" ? dias : -dias));
    setFechaBase(nuevaFecha);
  };

  const obtenerDiasSemana = () => {
    const dias = [];
    const inicio = new Date(fechaBase);
    inicio.setDate(inicio.getDate() - inicio.getDay()); // Comenzar en domingo
    
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }
    
    return dias;
  };

  const obtenerDiasMes = () => {
    const dias = [];
    for (let i = 0; i < 30; i++) {
      const dia = new Date(fechaBase);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const obtenerBloquesPorDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return disponibilidad.filter(b => b.fecha === fechaStr);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "libre": return "bg-green-100 border-green-300 hover:bg-green-200";
      case "ocupado": return "bg-red-100 border-red-300 hover:bg-red-200";
      case "mantenimiento": return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
      default: return "bg-gray-100 border-gray-300";
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "libre": return "default";
      case "ocupado": return "destructive";
      case "mantenimiento": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* Controles superiores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Vista de Disponibilidad
              </CardTitle>
              <CardDescription>
                Consulta los horarios libres y ocupados para planificar tus reservas
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
              <label className="text-sm font-medium mb-2 block">Laboratorio</label>
              <Select value={laboratorioSeleccionado} onValueChange={setLaboratorioSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un laboratorio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los laboratorios</SelectItem>
                  {laboratorios.map(lab => (
                    <SelectItem key={lab.id} value={lab.id}>{lab.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Recurso</label>
              <Select value={recursoSeleccionado} onValueChange={setRecursoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un recurso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los recursos</SelectItem>
                  {recursos.map(rec => (
                    <SelectItem key={rec.id} value={rec.id}>{rec.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Navegación de fechas */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => navegarSemana("anterior")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="font-semibold">
              {fechaBase.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navegarSemana("siguiente")}>
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
          </div>
        </CardContent>
      </Card>

      {/* Vista Semanal */}
      {vistaActual === "semanal" && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {obtenerDiasSemana().map((dia, idx) => {
                const bloques = obtenerBloquesPorDia(dia);
                const esHoy = dia.toDateString() === new Date().toDateString();
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className={`text-center p-2 rounded-t-lg border-b-2 ${
                      esHoy ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted'
                    }`}>
                      <div className="text-xs font-medium uppercase">
                        {dia.toLocaleDateString('es-ES', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold">
                        {dia.getDate()}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {bloques.map((bloque, bidx) => (
                        <button
                          key={bidx}
                          className={`w-full p-2 text-xs rounded border transition-colors ${getEstadoColor(bloque.estado)}`}
                          title={`${bloque.hora_inicio} - ${bloque.hora_fin} (${bloque.estado})`}
                        >
                          <div className="font-medium">{bloque.hora_inicio}</div>
                          <div className="text-[10px] opacity-75">
                            {bloque.estado === "ocupado" ? "Ocupado" : 
                             bloque.estado === "libre" ? "Libre" : "Mant."}
                          </div>
                        </button>
                      ))}
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
                const libres = bloques.filter(b => b.estado === "libre").length;
                const ocupados = bloques.filter(b => b.estado === "ocupado").length;
                const mantenimiento = bloques.filter(b => b.estado === "mantenimiento").length;
                const esHoy = dia.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={idx} 
                    className={`p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                      esHoy ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-2 ${esHoy ? 'text-primary' : ''}`}>
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