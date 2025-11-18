// src/pages/LabAdminDashboard.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, Users, Package, FileText, Clock, Shield, 
  Calendar, ClipboardList 
} from "lucide-react";
import { useLabAdmin } from "@/hooks/useLabAdmin";
import LabProfileForm from "@/components/lab/LabProfileForm";
import ResponsibleList from "@/components/lab/ResponsibleList";
import ResourceList from "@/components/lab/ResourceList";
import PoliciesEditor from "@/components/lab/PoliciesEditor";
import LabHistory from "@/components/lab/LabHistory";
import LabAvailabilityPage from "@/components/lab/LabAvailabilityPage";
import LabRequestsManager from "@/components/lab/LabRequestsManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LabAdminDashboard() {
  const { laboratorios, laboratorio, setLaboratorio, isLoading } = useLabAdmin();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando laboratorio...</p>
        </div>
      </div>
    );
  }

  if (!laboratorio) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto mt-20">
          <CardHeader>
            <CardTitle className="text-center">Sin laboratorio asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              No estás registrado como responsable de ningún laboratorio.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* HEADER CON SELECTOR DE LABORATORIO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Laboratorio</h1>
          <p className="text-muted-foreground">Administra tu laboratorio y sus recursos</p>
        </div>

        {/* SELECTOR DE LABORATORIO (solo aparece si hay más de 1) */}
        {laboratorios.length > 1 && (
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <Select
              value={laboratorio.id.toString()}
              onValueChange={(value) => setLaboratorio(Number(value))}
            >
              <SelectTrigger className="w-72">
                <SelectValue>
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{laboratorio.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {laboratorio.codigo} • {laboratorio.ubicacion}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {laboratorios.map((lab) => (
                  <SelectItem key={lab.id} value={lab.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{lab.nombre}</span>
                      <span className="text-xs text-muted-foreground">
                        {lab.codigo} • {lab.ubicacion}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* SI SOLO TIENE UNO, MUESTRA COMO ANTES */}
        {laboratorios.length === 1 && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{laboratorio.nombre}</p>
              <p className="text-xs text-muted-foreground">{laboratorio.codigo}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="requests">
            <ClipboardList className="mr-2 h-4 w-4" />
            Solicitudes
          </TabsTrigger>
          <TabsTrigger value="profile">
            <Shield className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="responsibles">
            <Users className="mr-2 h-4 w-4" />
            Responsables
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Package className="mr-2 h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="policies">
            <FileText className="mr-2 h-4 w-4" />
            Políticas
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-2 h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Calendar className="mr-2 h-4 w-4" />
            Disponibilidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <LabRequestsManager />
        </TabsContent>
        <TabsContent value="profile">
          <LabProfileForm />
        </TabsContent>
        <TabsContent value="responsibles">
          <ResponsibleList />
        </TabsContent>
        <TabsContent value="resources">
          <ResourceList />
        </TabsContent>
        <TabsContent value="policies">
          <PoliciesEditor />
        </TabsContent>
        <TabsContent value="history">
          <LabHistory />
        </TabsContent>
        <TabsContent value="availability" className="space-y-6">
          <LabAvailabilityPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}