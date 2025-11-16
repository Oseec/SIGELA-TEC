import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useReservations } from "@/hooks/useReservations";

const ReservationCard = ({ reservation, status, cancelReservation }: { reservation: any; status: string; cancelReservation: any }) => {

  const navigate = useNavigate();

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
      case "onReview":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            En Revisión
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
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
          {/* Ver detalles → SIEMPRE aparece */}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/reservations/${reservation.id}`)}
          >
            Ver detalles
          </Button>

          {/* Cancelar → SOLO para pendientes */}
          {status === "pending" && (
            <Button
              variant="destructive"
              onClick={() => {
                const ok = confirm("¿Seguro que desea cancelar esta reserva?");
                if (!ok) return;
                cancelReservation?.mutate(reservation.id);
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Reservations() {

  const { data: reservations, isLoading, cancelReservation } = useReservations();

  if (isLoading) return <p>Cargando...</p>;
  if (!reservations) return <p>No hay reservas.</p>;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
          <p className="text-muted-foreground">Administra tus solicitudes de laboratorio</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="flex gap-2 w-full overflow-x-auto whitespace-nowrap lg:w-auto lg:inline-flex">
          <TabsTrigger value="pending" className="whitespace-nowrap">
            Pendientes ({reservations.pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="whitespace-nowrap">
            Aprobadas ({reservations.approved.length})
          </TabsTrigger>
          <TabsTrigger value="onReview" className="whitespace-nowrap">
            En Revisión ({reservations.inReview.length})
          </TabsTrigger>
          <TabsTrigger value="canceled" className="whitespace-nowrap">
            Canceladas ({reservations.canceled.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="whitespace-nowrap">
            Rechazadas ({reservations.rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.pending.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                status="pending"
                cancelReservation={cancelReservation}
              />
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

        <TabsContent value="onReview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.inReview.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} status="onReview" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="canceled" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.canceled.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} status="canceled" />
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
