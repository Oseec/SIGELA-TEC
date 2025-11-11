// src/pages/TechnicianDashboard.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Package, Wrench, FileText } from "lucide-react";
import { useApprovedRequests } from "@/hooks/useApprovedRequests";
import RequestCard from "@/components/RequestCard";
import { toast } from "@/components/ui/sonner";

// Datos mock para inventario, mantenimiento y reportes (mientras implementas 2.2, 2.3, 2.4)
const mockInventory = [
  { name: "Osciloscopios", total: 5, available: 3, reserved: 1, maintenance: 1 },
  { name: "Resistencias", total: 500, available: 45, reserved: 0, maintenance: 0, alert: true },
];

const mockMaintenance = [
  { equipment: "Generador GF-001", type: "Preventivo", status: "Programado", date: "2025-11-20" },
];

export default function TechnicianDashboard() {
  const { data: requests, isLoading, error } = useApprovedRequests();
  const [activeTab, setActiveTab] = useState("requests");

  if (error) {
    toast.error("Error cargando solicitudes");
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel del Técnico</h1>
        <p className="text-muted-foreground">
          Gestión de solicitudes, inventario y mantenimiento
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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

        {/* === PESTAÑA: SOLICITUDES APROBADAS === */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Aprobadas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Gestiona entregas y devoluciones de recursos
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8">Cargando solicitudes...</p>
              ) : requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay solicitudes aprobadas pendientes.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === PESTAÑA: INVENTARIO (mock por ahora) === */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockInventory.map((item, i) => (
                  <Card key={i} className={item.alert ? "border-warning" : ""}>
                    <CardHeader>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      {item.alert && (
                        <Badge variant="destructive">Stock Bajo</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span>{item.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Disponible:</span>
                          <span className="text-success">{item.available}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === PESTAÑA: MANTENIMIENTO (mock) === */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Programados</CardTitle>
            </CardHeader>
            <CardContent>
              {mockMaintenance.map((m, i) => (
                <div key={i} className="p-4 border rounded-lg mb-3">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{m.equipment}</h4>
                    <Badge variant={m.status === "Programado" ? "secondary" : "default"}>
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {m.type} • {m.date}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === PESTAÑA: REPORTES (mock) === */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Operativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 justify-start text-left">
                  <div>
                    <div className="font-semibold">Reporte de Entregas</div>
                    <div className="text-sm text-muted-foreground">
                      Resumen de entregas y devoluciones
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start text-left">
                  <div>
                    <div className="font-semibold">Reporte de Mantenimiento</div>
                    <div className="text-sm text-muted-foreground">
                      Historial de intervenciones
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