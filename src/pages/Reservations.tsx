import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const reservations = {
  pending: [
    {
      id: 1,
      lab: "Laboratorio de Física Avanzada",
      code: "LAB-FIS-001",
      date: "2025-11-08",
      time: "10:00 - 12:00",
      purpose: "Práctica de oscilaciones y ondas",
      equipment: ["Osciloscopio", "Generador de señales"],
      requestDate: "2025-11-03",
    },
  ],
  approved: [
    {
      id: 2,
      lab: "Laboratorio de Computación",
      code: "LAB-COM-005",
      date: "2025-11-05",
      time: "14:00 - 16:00",
      purpose: "Desarrollo de proyecto de bases de datos",
      equipment: ["Computadora", "Acceso a servidor"],
      approvedBy: "Dr. Carlos Mora",
      requestDate: "2025-11-01",
    },
    {
      id: 3,
      lab: "Laboratorio de Química Orgánica",
      code: "LAB-QUI-003",
      date: "2025-11-06",
      time: "09:00 - 11:00",
      purpose: "Síntesis de compuestos orgánicos",
      equipment: ["Campana extractora", "Balanza analítica"],
      approvedBy: "Dra. María Fernández",
      requestDate: "2025-10-30",
    },
  ],
  completed: [
    {
      id: 4,
      lab: "Laboratorio de Electrónica",
      code: "LAB-ELE-002",
      date: "2025-10-30",
      time: "15:00 - 17:00",
      purpose: "Ensamblaje de circuitos digitales",
      equipment: ["Estación de soldadura", "Multímetro"],
      completedDate: "2025-10-30",
    },
  ],
  rejected: [
    {
      id: 5,
      lab: "Laboratorio de Materiales",
      code: "LAB-MAT-001",
      date: "2025-11-04",
      time: "11:00 - 13:00",
      purpose: "Ensayos de tracción",
      equipment: ["Máquina de ensayos universal"],
      rejectionReason: "Mantenimiento programado en el horario solicitado",
      rejectedBy: "Ing. Roberto Solís",
      requestDate: "2025-11-02",
    },
  ],
};

const ReservationCard = ({ reservation, status }: { reservation: any; status: string }) => {
  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobada
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completada
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazada
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{reservation.lab}</CardTitle>
            <p className="text-sm text-muted-foreground">{reservation.code}</p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{reservation.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.time}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span>{reservation.purpose}</span>
          </div>
        </div>

        {reservation.equipment && (
          <div>
            <p className="text-sm font-medium mb-2">Equipos solicitados:</p>
            <div className="flex flex-wrap gap-2">
              {reservation.equipment.map((eq: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {eq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {reservation.approvedBy && (
          <div className="text-sm pt-2 border-t">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Aprobado por: {reservation.approvedBy}</span>
            </div>
          </div>
        )}

        {reservation.rejectionReason && (
          <div className="text-sm pt-2 border-t">
            <p className="font-medium text-destructive mb-1">Motivo de rechazo:</p>
            <p className="text-muted-foreground">{reservation.rejectionReason}</p>
            {reservation.rejectedBy && (
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <User className="h-4 w-4" />
                <span>Rechazado por: {reservation.rejectedBy}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex gap-2">
          {status === "pending" && (
            <>
              <Button variant="outline" className="flex-1">
                Modificar
              </Button>
              <Button variant="destructive">Cancelar</Button>
            </>
          )}
          {status === "approved" && (
            <Button variant="outline" className="flex-1">
              Ver detalles
            </Button>
          )}
          {(status === "completed" || status === "rejected") && (
            <Button variant="outline" className="flex-1">
              Ver detalles
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Reservations() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
          <p className="text-muted-foreground">Administra tus solicitudes de laboratorio</p>
        </div>
        <Button size="lg">Nueva Reserva</Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="pending">
            Pendientes ({reservations.pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprobadas ({reservations.approved.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({reservations.completed.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazadas ({reservations.rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.pending.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} status="pending" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.approved.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} status="approved" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.completed.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} status="completed" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.rejected.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} status="rejected" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
