import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, History, Bell, Clock, MapPin } from "lucide-react";

export default function StudentDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const upcomingReservations = [
    {
      resource: "Osciloscopio Digital",
      status: "Aprobada",
      date: "2024-03-15",
      time: "09:00 - 11:00",
      requestedBy: "Dr. García",
      location: "Lab. Física Avanzada",
    },
    {
      resource: "Generador de Funciones",
      status: "Pendiente",
      date: "2024-03-18",
      time: "13:00 - 15:00",
      requestedBy: "Investigación",
      location: "Lab. Física Avanzada",
    },
  ];

  const searchResults = [
    {
      name: "Osciloscopio Digital",
      status: "Disponible",
      location: "Lab. Física Avanzada • Edificio Ciencias",
      available: true,
    },
    {
      name: "Generador de Funciones",
      status: "Reservado",
      location: "Lab. Física Avanzada • Edificio Ciencias",
      available: false,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-foreground mb-2">¡Bienvenido!</h1>
        <p className="text-muted-foreground">
          Tienes <span className="font-semibold text-primary">2 reservas próximas</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximas Reservas
          </CardTitle>
          <CardDescription>Tus reservas programadas para los próximos días</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingReservations.map((reservation, index) => (
            <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{reservation.resource}</h3>
                  <Badge variant={reservation.status === "Aprobada" ? "default" : "secondary"}>
                    {reservation.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {reservation.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {reservation.time}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{reservation.location}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Solicitado por: {reservation.requestedBy}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ver Detalles
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Avisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Recursos/Laboratorios</CardTitle>
              <CardDescription>Encuentra equipos y espacios disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipos, laboratorios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Resultados de búsqueda:</h3>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{result.name}</h4>
                      <p className="text-sm text-muted-foreground">{result.location}</p>
                      <Badge
                        variant={result.available ? "default" : "secondary"}
                        className="mt-2"
                      >
                        {result.status}
                      </Badge>
                    </div>
                    <Button disabled={!result.available}>
                      {result.available ? "Reservar" : "No Disponible"}
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
              <CardTitle>Calendario Personal</CardTitle>
              <CardDescription>
                Vista de todas tus reservas aprobadas y pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingReservations.map((reservation, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{reservation.resource}</h4>
                      <Badge variant={reservation.status === "Aprobada" ? "default" : "secondary"}>
                        {reservation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {reservation.date} • {reservation.time}
                    </p>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial Personal</CardTitle>
              <CardDescription>
                Historial de reservas pasadas y constancias académicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: "Multímetro Digital",
                    status: "Completado",
                    date: "2024-03-10",
                    time: "14:00 - 16:00",
                    note: "Devuelto exitosamente",
                  },
                  {
                    name: "Protoboard",
                    status: "Completado",
                    date: "2024-03-08",
                    time: "10:00 - 12:00",
                    note: "Devuelto exitosamente",
                  },
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.date} • {item.time}
                    </p>
                    <p className="text-sm text-success mt-1">{item.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Alertas y recordatorios importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-accent/50">
                  <p className="font-medium mb-1">
                    Su reserva para el Osciloscopio Digital ha sido aprobada
                  </p>
                  <p className="text-sm text-muted-foreground">Hace 2 horas</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-1">Recordatorio: Entrega mañana a las 11:00 AM</p>
                  <p className="text-sm text-muted-foreground">Hace 5 horas</p>
                </div>
                <div className="p-4 text-center text-muted-foreground">
                  No hay más notificaciones
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
