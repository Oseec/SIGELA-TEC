import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";

const laboratories = [
  {
    id: 1,
    name: "Laboratorio de Física Avanzada",
    code: "LAB-FIS-001",
    location: "Edificio de Ciencias, Piso 2",
    capacity: 30,
    status: "available",
    equipment: ["Osciloscopios", "Generadores de señales", "Multímetros"],
    nextAvailable: "Hoy 14:00",
    department: "Escuela de Física",
  },
  {
    id: 2,
    name: "Laboratorio de Química Orgánica",
    code: "LAB-QUI-003",
    location: "Edificio de Química, Piso 1",
    capacity: 25,
    status: "occupied",
    equipment: ["Campanas extractoras", "Balanzas analíticas", "Destiladores"],
    nextAvailable: "Mañana 08:00",
    department: "Escuela de Química",
  },
  {
    id: 3,
    name: "Laboratorio de Computación",
    code: "LAB-COM-005",
    location: "Edificio de Computación, Piso 3",
    capacity: 40,
    status: "available",
    equipment: ["Computadoras HP EliteDesk", "Monitores 27\"", "Software especializado"],
    nextAvailable: "Disponible",
    department: "Escuela de Computación",
  },
  {
    id: 4,
    name: "Laboratorio de Electrónica",
    code: "LAB-ELE-002",
    location: "Edificio de Ingeniería, Piso 1",
    capacity: 28,
    status: "maintenance",
    equipment: ["Estaciones de soldadura", "Fuentes de poder", "Protoboards"],
    nextAvailable: "2025-11-10",
    department: "Escuela de Electrónica",
  },
  {
    id: 5,
    name: "Laboratorio de Biología Molecular",
    code: "LAB-BIO-004",
    location: "Edificio de Biología, Piso 2",
    capacity: 20,
    status: "available",
    equipment: ["Centrífugas", "Termocicladores", "Microscopios"],
    nextAvailable: "Hoy 16:00",
    department: "Escuela de Biología",
  },
  {
    id: 6,
    name: "Laboratorio de Materiales",
    code: "LAB-MAT-001",
    location: "Edificio de Materiales, Piso 1",
    capacity: 15,
    status: "available",
    equipment: ["Máquina de ensayos", "Durómetros", "Microscopio metalográfico"],
    nextAvailable: "Disponible",
    department: "Escuela de Ciencia de Materiales",
  },
];

export default function Laboratories() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disponible
          </Badge>
        );
      case "occupied":
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Ocupado
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border-orange-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Mantenimiento
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Laboratorios</h1>
        <p className="text-muted-foreground">Explora y reserva los laboratorios disponibles</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o departamento..."
                className="pl-10"
              />
            </div>
            <Button>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Laboratories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {laboratories.map((lab) => (
          <Card key={lab.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{lab.name}</CardTitle>
                  <CardDescription>{lab.code}</CardDescription>
                </div>
                {getStatusBadge(lab.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{lab.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Capacidad: {lab.capacity} personas</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{lab.nextAvailable}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Equipos disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {lab.equipment.slice(0, 2).map((eq, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {eq}
                    </Badge>
                  ))}
                  {lab.equipment.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{lab.equipment.length - 2} más
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button className="flex-1" disabled={lab.status !== "available"}>
                  Reservar
                </Button>
                <Button variant="outline">Ver detalles</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
