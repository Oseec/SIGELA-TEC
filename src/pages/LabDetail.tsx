import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Phone, Mail, MapPin, Package, Calendar, FileText, History } from "lucide-react";

export default function LabDetail() {
  const labInfo = {
    name: "Laboratorio de Física Avanzada",
    code: "LAB-FIS-001",
    location: "Edificio de Ciencias, Piso 3, Aula 301-A",
    campus: "TEC - Campus Central",
    department: "Escuela de Física",
  };

  const responsibles = [
    {
      name: "Dr. María Elena Rodríguez",
      role: "Responsable Principal",
      email: "mrodriguez@tec.cr",
      phone: "+1 (2) 234-5678",
    },
    {
      name: "Ing. Carlos Mendoza",
      role: "Coordinador Técnico",
      email: "cmendoza@tec.cr",
      phone: "+1 (2) 234-5679",
    },
  ];

  const equipment = [
    {
      name: "Osciloscopio Digital",
      code: "OSC-001",
      status: "Disponible",
      lastMaintenance: "2024-03-15",
    },
    {
      name: "Generador de Funciones",
      code: "GEN-001",
      status: "Reservado",
      lastMaintenance: "2024-02-28",
    },
    {
      name: "Multímetro Digital",
      code: "MUL-001",
      status: "Mantenimiento",
      lastMaintenance: "2024-01-20",
    },
  ];

  const materials = [
    {
      name: "Resistencias 1/4W Surtido",
      code: "MAT-001",
      quantity: "245 pcs",
      reorderPoint: "50 pcs",
      supplier: "Digikey",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {labInfo.name}
          </h1>
          <p className="text-muted-foreground">Código: {labInfo.code}</p>
        </div>
        <Button>Editar Información</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación Exacta</p>
                <p className="font-medium">{labInfo.location}</p>
                <p className="text-sm text-muted-foreground mt-1">{labInfo.campus}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Departamento/Escuela</p>
                <p className="font-medium">{labInfo.department}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Responsables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {responsibles.map((person, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div>
                  <h3 className="font-semibold">{person.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {person.role}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {person.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {person.phone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Políticas de Uso y Requisitos Académicos</CardTitle>
          <CardDescription>Normas y requisitos para el acceso y uso del laboratorio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Requisitos Previos</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Curso completado: Física General I y Física General II</li>
              <li>Curso completado: Matemática I - Ecuaciones Diferenciales</li>
              <li>Horario disponible: Lunes a Viernes 8:00 AM - 4:00 PM</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Inducción Obligatoria</h4>
            <p className="text-sm text-muted-foreground">
              Se realizará una inducción de seguridad antes del primer uso.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="mr-2 h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Equipos Fijos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {equipment.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Código: {item.code}</p>
                    <p className="text-sm text-muted-foreground">
                      Último mantenimiento: {item.lastMaintenance}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.status === "Disponible"
                          ? "default"
                          : item.status === "Reservado"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {item.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Materiales Consumibles</h3>
                {materials.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Código: {item.code}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Cantidad:</span>
                        <p className="font-medium">{item.quantity}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Punto de reorden:</span>
                        <p className="font-medium">{item.reorderPoint}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Proveedor:</span>
                        <p className="font-medium">{item.supplier}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Solicitar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Disponibilidad</CardTitle>
              <CardDescription>Vista de calendario próximamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Vista de calendario en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Reservables</CardTitle>
              <CardDescription>Recursos disponibles para reserva</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipment
                  .filter((item) => item.status === "Disponible")
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Código: {item.code}</p>
                      </div>
                      <Button>Reservar</Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial del Laboratorio</CardTitle>
              <CardDescription>Registro de actividades y eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Historial próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
