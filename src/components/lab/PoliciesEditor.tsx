// src/components/lab/PoliciesEditor.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  Clock,
  Users,
  BookOpen,
  Shield,
  AlertCircle,
  Save,
  Edit,
} from "lucide-react";
import { useLabAdmin } from "@/hooks/useLabAdmin";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DiaSemana = "lunes" | "martes" | "miércoles" | "jueves" | "viernes" | "sábado" | "domingo";

interface HorarioDia {
  dia: DiaSemana;
  abierto: boolean;
  horaInicio: string;
  horaFin: string;
}

interface Requisito {
  id: string;
  tipo: "curso" | "certificacion" | "induccion" | "otro";
  nombre: string;
  descripcion: string;
  obligatorio: boolean;
}

export default function PoliciesEditor() {
  const { laboratorio } = useLabAdmin();
  const [editMode, setEditMode] = useState(false);

  // Estado para horarios
  const [horarios, setHorarios] = useState<HorarioDia[]>([
    { dia: "lunes", abierto: true, horaInicio: "08:00", horaFin: "18:00" },
    { dia: "martes", abierto: true, horaInicio: "08:00", horaFin: "18:00" },
    { dia: "miércoles", abierto: true, horaInicio: "08:00", horaFin: "18:00" },
    { dia: "jueves", abierto: true, horaInicio: "08:00", horaFin: "18:00" },
    { dia: "viernes", abierto: true, horaInicio: "08:00", horaFin: "18:00" },
    { dia: "sábado", abierto: false, horaInicio: "08:00", horaFin: "12:00" },
    { dia: "domingo", abierto: false, horaInicio: "08:00", horaFin: "12:00" },
  ]);

  // Estado para capacidad
  const [capacidadMaxima, setCapacidadMaxima] = useState<number>(20);

  // Estado para requisitos
  const [requisitos, setRequisitos] = useState<Requisito[]>([
    {
      id: "1",
      tipo: "curso",
      nombre: "Física II",
      descripcion: "Curso previo requerido para usar equipos avanzados",
      obligatorio: true,
    },
    {
      id: "2",
      tipo: "induccion",
      nombre: "Inducción de Seguridad",
      descripcion: "Capacitación en normas de seguridad del laboratorio",
      obligatorio: true,
    },
  ]);

  // Estado para el diálogo de agregar requisito
  const [showAddRequisito, setShowAddRequisito] = useState(false);
  const [nuevoRequisito, setNuevoRequisito] = useState<Requisito>({
    id: "",
    tipo: "curso",
    nombre: "",
    descripcion: "",
    obligatorio: true,
  });

  // Estado para reglas adicionales
  const [reglasAdicionales, setReglasAdicionales] = useState<string>(
    "• Uso obligatorio de bata de laboratorio\n• Prohibido comer o beber dentro del laboratorio\n• Los equipos deben ser devueltos limpios y en buen estado"
  );

  const handleToggleDia = (dia: DiaSemana) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia === dia ? { ...h, abierto: !h.abierto } : h))
    );
  };

  const handleChangeHorario = (
    dia: DiaSemana,
    campo: "horaInicio" | "horaFin",
    valor: string
  ) => {
    setHorarios((prev) =>
      prev.map((h) => (h.dia === dia ? { ...h, [campo]: valor } : h))
    );
  };

  const handleAgregarRequisito = () => {
    if (!nuevoRequisito.nombre.trim()) {
      toast.error("El nombre del requisito es obligatorio");
      return;
    }

    const nuevo: Requisito = {
      ...nuevoRequisito,
      id: Date.now().toString(),
    };

    setRequisitos((prev) => [...prev, nuevo]);
    setNuevoRequisito({
      id: "",
      tipo: "curso",
      nombre: "",
      descripcion: "",
      obligatorio: true,
    });
    setShowAddRequisito(false);
    toast.success("Requisito agregado");
  };

  const handleEliminarRequisito = (id: string) => {
    setRequisitos((prev) => prev.filter((r) => r.id !== id));
    toast.success("Requisito eliminado");
  };

  const handleGuardar = () => {
    // Aquí irá la lógica para guardar en Supabase
    console.log("Guardando políticas:", {
      horarios,
      capacidadMaxima,
      requisitos,
      reglasAdicionales,
    });
    toast.success("Políticas actualizadas correctamente");
    setEditMode(false);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "curso":
        return <BookOpen className="h-4 w-4" />;
      case "certificacion":
        return <Shield className="h-4 w-4" />;
      case "induccion":
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "curso":
        return "bg-blue-500";
      case "certificacion":
        return "bg-green-500";
      case "induccion":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de editar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Políticas y Configuración</h2>
          <p className="text-sm text-muted-foreground">
            Configura los horarios, requisitos y reglas del laboratorio
          </p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGuardar}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Políticas
            </Button>
          )}
        </div>
      </div>

      {/* Horarios de Funcionamiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de Funcionamiento
          </CardTitle>
          <CardDescription>
            Define los días y horarios en que el laboratorio está disponible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {horarios.map((horario) => (
            <div
              key={horario.dia}
              className="flex items-center gap-4 p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-[140px]">
                <input
                  type="checkbox"
                  checked={horario.abierto}
                  onChange={() => handleToggleDia(horario.dia)}
                  disabled={!editMode}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span
                  className={`font-medium capitalize ${
                    !horario.abierto && "text-muted-foreground"
                  }`}
                >
                  {horario.dia}
                </span>
              </div>

              {horario.abierto ? (
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">De:</Label>
                    <Input
                      type="time"
                      value={horario.horaInicio}
                      onChange={(e) =>
                        handleChangeHorario(horario.dia, "horaInicio", e.target.value)
                      }
                      disabled={!editMode}
                      className="w-32"
                    />
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Hasta:</Label>
                    <Input
                      type="time"
                      value={horario.horaFin}
                      onChange={(e) =>
                        handleChangeHorario(horario.dia, "horaFin", e.target.value)
                      }
                      disabled={!editMode}
                      className="w-32"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground italic">Cerrado</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Capacidad Máxima */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacidad del Laboratorio
          </CardTitle>
          <CardDescription>
            Número máximo de personas que pueden usar el laboratorio simultáneamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Capacidad máxima:</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={capacidadMaxima}
              onChange={(e) => setCapacidadMaxima(Number(e.target.value))}
              disabled={!editMode}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">personas</span>
          </div>
        </CardContent>
      </Card>

      {/* Requisitos Académicos y de Seguridad */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Requisitos de Acceso
              </CardTitle>
              <CardDescription>
                Cursos, certificaciones o inducciones requeridas para usar el laboratorio
              </CardDescription>
            </div>
            {editMode && (
              <Button
                onClick={() => setShowAddRequisito(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Requisito
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {requisitos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay requisitos configurados</p>
              {editMode && (
                <Button
                  onClick={() => setShowAddRequisito(true)}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer requisito
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {requisitos.map((req) => (
                <div
                  key={req.id}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  <div
                    className={`h-10 w-10 rounded-full ${getTipoColor(
                      req.tipo
                    )} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    {getTipoIcon(req.tipo)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{req.nombre}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {req.descripcion}
                        </p>
                      </div>
                      {editMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarRequisito(req.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={req.obligatorio ? "default" : "secondary"}>
                        {req.obligatorio ? "Obligatorio" : "Opcional"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {req.tipo}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reglas Adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Reglas y Normas Adicionales
          </CardTitle>
          <CardDescription>
            Reglas generales de comportamiento y uso del laboratorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reglasAdicionales}
            onChange={(e) => setReglasAdicionales(e.target.value)}
            disabled={!editMode}
            rows={8}
            placeholder="Escribe las reglas del laboratorio, una por línea..."
            className="font-sans"
          />
        </CardContent>
      </Card>

      {/* Diálogo para agregar requisito */}
      <Dialog open={showAddRequisito} onOpenChange={setShowAddRequisito}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Requisito</DialogTitle>
            <DialogDescription>
              Define un nuevo requisito para el uso del laboratorio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de requisito</Label>
              <Select
                value={nuevoRequisito.tipo}
                onValueChange={(value: any) =>
                  setNuevoRequisito((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curso">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Curso previo
                    </div>
                  </SelectItem>
                  <SelectItem value="certificacion">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Certificación
                    </div>
                  </SelectItem>
                  <SelectItem value="induccion">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Inducción
                    </div>
                  </SelectItem>
                  <SelectItem value="otro">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Otro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre del requisito *</Label>
              <Input
                value={nuevoRequisito.nombre}
                onChange={(e) =>
                  setNuevoRequisito((prev) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="Ej: Física II, Certificación en seguridad..."
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={nuevoRequisito.descripcion}
                onChange={(e) =>
                  setNuevoRequisito((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                placeholder="Describe brevemente el requisito..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="obligatorio"
                checked={nuevoRequisito.obligatorio}
                onChange={(e) =>
                  setNuevoRequisito((prev) => ({
                    ...prev,
                    obligatorio: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="obligatorio" className="cursor-pointer">
                Este requisito es obligatorio
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRequisito(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAgregarRequisito}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}