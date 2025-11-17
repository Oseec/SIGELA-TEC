// src/pages/LabAdminDashboard.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Package, FileText, Clock, Shield, Calendar } from "lucide-react";
import { useLabAdmin } from "@/hooks/useLabAdmin";
import LabProfileForm from "@/components/lab/LabProfileForm";
import ResponsibleList from "@/components/lab/ResponsibleList";
import ResourceList from "@/components/lab/ResourceList";
import PoliciesEditor from "@/components/lab/PoliciesEditor";
import LabHistory from "@/components/lab/LabHistory";
import LabAvailabilityPage from "@/components/lab/LabAvailabilityPage";

export default function LabAdminDashboard() {
  const { laboratorio, isLoading } = useLabAdmin();

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Laboratorio</h1>
          <p className="text-muted-foreground">Administra tu laboratorio y sus recursos</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{laboratorio.nombre}</p>
            <p className="text-xs text-muted-foreground">{laboratorio.codigo}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
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
             Disponibilidad y Recursos
          </TabsTrigger>
        </TabsList>

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