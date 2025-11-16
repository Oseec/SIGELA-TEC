import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservationDetails } from "@/hooks/useReservationDetails";
import { Link } from "react-router-dom";

export default function ReservationDetail() {
  const { id } = useParams();
  const { data: reservation, isLoading } = useReservationDetails(Number(id));

  if (isLoading) return <p>Cargando detalles...</p>;
  if (!reservation) return <p>No se encontró la reserva.</p>;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" asChild>
        <Link to="/reservations">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de la Reserva #{reservation.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Usuario */}
          <div>
            <p className="text-sm font-semibold">Solicitado por:</p>
            <p>{reservation.perfil_usuario.nombre_completo}</p>
          </div>

          {/* Laboratorio */}
          <div>
            <p className="text-sm font-semibold">Laboratorio:</p>
            <p>{reservation.laboratorio.nombre}</p>
          </div>

          {/* Fechas */}
          <div>
            <p className="text-sm font-semibold">Fecha:</p>
            <p>
              {reservation.fecha_hora_inicio.split("T")[0]} •{" "}
              {reservation.fecha_hora_inicio.substring(11, 16)} —{" "}
              {reservation.fecha_hora_fin.substring(11, 16)}
            </p>
          </div>

          {/* Motivo */}
          <div>
            <p className="text-sm font-semibold">Motivo:</p>
            <p>{reservation.motivo}</p>
          </div>

          {/* Recursos solicitados */}
          <div>
            <p className="text-sm font-semibold mb-2">Recursos solicitados:</p>

            {reservation.recursos.length === 0 ? (
              <p className="text-muted-foreground text-sm">Ninguno</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {reservation.recursos.map((r) => (
                  <Badge key={r.id} variant="outline">
                    {r.nombre} × {r.cantidad}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Estado */}
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <Badge>{reservation.estado}</Badge>
          </div>

          {/* Aprobado por */}
          {reservation.aprobado_por && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Aprobado por: {reservation.aprobado_por}</span>
            </div>
          )}

          {/* Motivo de rechazo */}
          {reservation.motivo_rechazo && (
            <div>
              <p className="text-sm text-destructive">Motivo de rechazo:</p>
              <p>{reservation.motivo_rechazo}</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
