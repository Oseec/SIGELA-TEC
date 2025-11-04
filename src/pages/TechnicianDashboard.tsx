import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Package, Wrench, FileText, AlertTriangle, Calendar } from "lucide-react";

export default function TechnicianDashboard() {
  const approvedRequests = [
    {
      user: "Dr. García",
      resource: "Osciloscopio Digital",
      status: "Entregado",
      dates: "2024-03-15 - 2024-03-17",
    },
    {
      user: "Estudiante - María López",
      resource: "Multímetro Digital",
      status: "Pendiente",
      dates: "2024-03-16 - 2024-03-16",
    },
  ];

  const inventory = [
    {
      name: "Osciloscopios Digitales",
      total: 5,
      available: 3,
      reserved: 1,
      maintenance: 1,
      alert: false,
    },
    {
      name: "Resistencias 1/4W",
      total: 500,
      available: 45,
      reserved: 0,
      maintenance: 0,
      alert: true,
    },
    {
      name: "Capacitores Electrolíticos",
      total: 200,
      available: 150,
      reserved: 25,
      maintenance: 0,
      alert: false,
    },
  ];

  const maintenance = [
    {
      equipment: "Generador de Funciones GF-001",
      type: "Mantenimiento Preventivo",
      status: "Programado",
      date: "2024-03-20",
      responsible: "Ing. Carlos Mendoza",
    },
    {
      equipment: "Multímetro Digital MUL-003",
      type: "Reparación",
      status: "En Proceso",
      date: "2024-03-18",
      responsible: "Tec. Ana Jiménez",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Técnico</h1>
        <p className="text-muted-foreground">
          Gestión de solicitudes, inventario y mantenimiento
        </p>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">
            <ClipboardList className="mr-2 h-4 w-4" />
            Solicitudes
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="mr-2 h-4 w-4" />
            Mantenimiento
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Aprobadas</CardTitle>
              <CardDescription>
                Gestiona entregas y devoluciones de recursos asignados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedRequests.map((request, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{request.user}</TableCell>
                      <TableCell>{request.resource}</TableCell>
                      <TableCell>
                        <Badge
                          variant={request.status === "Entregado" ? "default" : "secondary"}
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.dates}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant={request.status === "Entregado" ? "outline" : "default"}
                            size="sm"
                          >
                            {request.status === "Entregado" ? "Marcar Devuelto" : "Entregar"}
                          </Button>
                          <Button variant="ghost" size="sm">
                            Ver Detalles
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Inventario</CardTitle>
              <CardDescription>
                Vista general de equipos y materiales con alertas de stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inventory.map((item, index) => (
                  <Card key={index} className={item.alert ? "border-warning" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        {item.alert && (
                          <Badge variant="destructive" className="ml-2">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Stock Bajo
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold">{item.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Disponible:</span>
                        <span className="font-semibold text-success">{item.available}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reservado:</span>
                        <span className="font-semibold text-warning">{item.reserved}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mantenimiento:</span>
                        <span className="font-semibold text-destructive">
                          {item.maintenance}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mantenimiento</CardTitle>
                  <CardDescription>Programar y gestionar mantenimientos</CardDescription>
                </div>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Nuevo Registro
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">Mantenimientos Programados:</h3>
              {maintenance.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium">{item.equipment}</h4>
                    <Badge
                      variant={item.status === "Programado" ? "secondary" : "default"}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <p className="font-medium">{item.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha:</span>
                      <p className="font-medium">{item.date}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Responsable:</span>
                      <p className="font-medium">{item.responsible}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm">
                      {item.status === "Programado" ? "Iniciar" : "Completar"}
                    </Button>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Operativos</CardTitle>
              <CardDescription>Genera reportes de actividad técnica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">Reporte de Entregas</div>
                    <div className="text-sm text-muted-foreground">
                      Resumen de entregas y devoluciones
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start">
                  <div className="text-left">
                    <div className="font-semibold">Reporte de Mantenimiento</div>
                    <div className="text-sm text-muted-foreground">
                      Historial de mantenimientos realizados
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
