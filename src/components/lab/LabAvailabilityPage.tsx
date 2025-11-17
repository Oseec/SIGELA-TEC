// src/components/lab/LabAvailabilityPage.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabCalendar from "./LabCalendar";
import ResourceCatalog from "./ResourceCatalog";

export default function LabAvailabilityPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Publicación de Disponibilidad y Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar">Calendario de Disponibilidad</TabsTrigger>
              <TabsTrigger value="catalog">Catálogo de Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <LabCalendar />
            </TabsContent>

            <TabsContent value="catalog">
              <ResourceCatalog />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}