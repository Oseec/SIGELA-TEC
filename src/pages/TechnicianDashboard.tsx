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
import InventoryList from "@/components/inventory/InventoryList";
import MaintenanceList from "@/components/maintenance/MaintenanceList";
import ReportCard from "@/components/reports/ReportCard";
import ReportModal from "@/components/reports/ReportModal";
import UsageReport from "@/components/reports/UsageReport";
import InventoryReport from "@/components/reports/InventoryReport";
import MaintenanceReport from "@/components/reports/MaintenanceReport";
import { useReports } from "@/hooks/useReports";
import { exportToPDF } from "@/lib/exportToPDF";
import { exportToExcel } from "@/lib/exportToExcel";


export default function TechnicianDashboard() {
  const { data: requests, isLoading, error } = useApprovedRequests();
  const [activeTab, setActiveTab] = useState("requests");

  const [modal, setModal] = useState<{
    open: boolean;
    type: 'usage' | 'inventory' | 'maintenance' | '';
  }>({
    open: false,
    type: ''
  });

  const { usage, inventory, maintenance } = useReports();

  if (error) {
    toast.error("Error cargando solicitudes");
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  const exportUsagePDF = () => {
    if (usage.data) {
      const columns = ["Recurso", "Entregas", "Usuarios Frecuentes"] as const;
      const data = usage.data.map(r => ({
        Recurso: r.recurso_nombre,
        Entregas: r.total_entregas,
        "Usuarios Frecuentes": r.usuarios_frecuentes?.join(', ') || 'Ninguno'
      }));
      exportToPDF("Reporte_Uso_Recursos", columns, data);
    }
  };

  const exportUsageExcel = () => {
    if (usage.data) {
      const data = usage.data.map(r => ({
        Recurso: r.recurso_nombre,
        Entregas: r.total_entregas,
        "Usuarios Frecuentes": r.usuarios_frecuentes?.join(', ') || 'Ninguno'
      }));
      exportToExcel("Reporte_Uso_Recursos", data);
    }
  };

  const exportInventoryPDF = () => {
    if (inventory.data) {
      const columns = ["Nombre", "Tipo", "Stock", "Punto Reorden", "Crítico", "Consumo 30d"] as const;
      const data = inventory.data.map(r => ({
        Nombre: r.nombre,
        Tipo: r.tipo,
        Stock: r.stock_actual,
        "Punto Reorden": r.punto_reorden,
        Crítico: r.critico ? "Sí" : "No",
        "Consumo 30d": r.consumo_ultimos_30_dias
      }));
      exportToPDF("Reporte_Inventario", columns, data);
    }
  };

  const exportInventoryExcel = () => {
    if (inventory.data) {
      const data = inventory.data.map(r => ({
        Nombre: r.nombre,
        Tipo: r.tipo,
        Stock: r.stock_actual,
        "Punto Reorden": r.punto_reorden,
        Crítico: r.critico ? "Sí" : "No",
        "Consumo 30d": r.consumo_ultimos_30_dias
      }));
      exportToExcel("Reporte_Inventario", data);
    }
  };

  const exportMaintenancePDF = () => {
    if (maintenance.data) {
      const columns = ["Recurso", "Mantenimientos", "Tiempo Promedio (días)", "Última Fecha"] as const;
      const data = maintenance.data.map(m => ({
        Recurso: m.recurso_nombre,
        Mantenimientos: m.total_mantenimientos,
        "Tiempo Promedio (días)": m.tiempo_promedio_fuera_dias,
        "Última Fecha": m.ultima_fecha
      }));
      exportToPDF("Reporte_Mantenimiento", columns, data);
    }
  };

  const exportMaintenanceExcel = () => {
    if (maintenance.data) {
      const data = maintenance.data.map(m => ({
        Recurso: m.recurso_nombre,
        Mantenimientos: m.total_mantenimientos,
        "Tiempo Promedio (días)": m.tiempo_promedio_fuera_dias,
        "Última Fecha": m.ultima_fecha
      }));
      exportToExcel("Reporte_Mantenimiento", data);
    }
  };

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

        {/* === PESTAÑA: INVENTARIO === */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventario</CardTitle>
              <p className="text-sm text-muted-foreground">
                Alta, baja, edición, stock y alertas
              </p>
            </CardHeader>
            <CardContent>
              <InventoryList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* === PESTAÑA: MANTENIMIENTO === */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Mantenimientos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Programar, registrar y dar seguimiento a intervenciones
              </p>
            </CardHeader>
            <CardContent>
              <MaintenanceList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* === PESTAÑA: REPORTES  === */}
        <TabsContent value="reports">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Reportes Operativos</h2>
              <p className="text-muted-foreground">Análisis en tiempo real del laboratorio</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <ReportCard
                title="Uso de Recursos"
                description="Recursos más utilizados y usuarios frecuentes"
                onView={() => setModal({ open: true, type: 'usage' })}
                onExportPDF={exportUsagePDF}
                onExportExcel={exportUsageExcel}
              />
              <ReportCard
                title="Estado de Inventario"
                description="Stock crítico y consumo mensual"
                onView={() => setModal({ open: true, type: 'inventory' })}
                onExportPDF={exportInventoryPDF}
                onExportExcel={exportInventoryExcel}
              />
              <ReportCard
                title="Eficiencia en Mantenimiento"
                description="Tiempo fuera de servicio y frecuencia"
                onView={() => setModal({ open: true, type: 'maintenance' })}
                onExportPDF={exportMaintenancePDF}
                onExportExcel={exportMaintenanceExcel}
              />
            </div>
          </div>

          {/* MODAL */}
          <ReportModal
            title={
              modal.type === 'usage' ? 'Uso de Recursos' :
              modal.type === 'inventory' ? 'Estado de Inventario' :
              modal.type === 'maintenance' ? 'Eficiencia en Mantenimiento' : ''
            }
            open={modal.open}
            onClose={() => setModal({ open: false, type: '' })}
          >
            {modal.type === 'usage' && <UsageReport onClose={() => setModal({ open: false, type: '' })} />}
            {modal.type === 'inventory' && <InventoryReport onClose={() => setModal({ open: false, type: '' })} />}
            {modal.type === 'maintenance' && <MaintenanceReport onClose={() => setModal({ open: false, type: '' })} />}
          </ReportModal>
        </TabsContent>
      </Tabs>
    </div>
  );
}