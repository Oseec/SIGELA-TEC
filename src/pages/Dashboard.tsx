import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Beaker,
  Calendar,
  Settings,
  UserPlus,
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";

const getBadgeVariant = (estado: string) => {
  switch (estado) {
    case "aprobada":
      return "default"; // verde
    case "pendiente":
    case "en_revision":
      return "secondary"; // gris
    case "rechazada":
      return "destructive"; // rojo
    case "cancelada":
      return "outline"; // neutro
    default:
      return "secondary";
  }
};

const getBadgeContent = (estado: string) => {
  switch (estado) {
    case "aprobada":
      return (
        <>
          <CheckCircle className="h-3 w-3 mr-1" />
          Aprobada
        </>
      );

    case "pendiente":
      return (
        <>
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendiente
        </>
      );

    case "en_revision":
      return (
        <>
          <Clock className="h-3 w-3 mr-1" />
          En revisión
        </>
      );

    case "rechazada":
      return (
        <>
          <XCircle className="h-3 w-3 mr-1" />
          Rechazada
        </>
      );

    case "cancelada":
      return (
        <>
          <XCircle className="h-3 w-3 mr-1" />
          Cancelada
        </>
      );

    default:
      return estado;
  }
};

export default function Dashboard() {

  const { stats, recentReservations, upcomingMaintenance } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Bienvenido al SIGLA</h1>
        <p className="text-lg opacity-90">Sistema de Gestión de Laboratorios Académicos - TEC</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.data?.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reservas Recientes
            </CardTitle>
            <CardDescription>Últimas solicitudes de laboratorio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReservations.data?.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{reservation.lab}</p>
                    <p className="text-sm text-muted-foreground">{reservation.user}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {reservation.fecha} • {reservation.horaInicio} - {reservation.horaFin}
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(reservation.estado)} className="shrink-0">
                    {getBadgeContent(reservation.estado)}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/reservations">
                Ver todas las reservas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Mantenimientos Próximos
            </CardTitle>
            <CardDescription>Calendario de mantenimiento preventivo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMaintenance.data?.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{maintenance.equipment}</p>
                    <p className="text-sm text-muted-foreground">{maintenance.lab}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {maintenance.date}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {maintenance.type}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/maintenance">
                Ver calendario completo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accede directamente a las funciones más utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2" asChild>
              <Link to="/users">
                <UserPlus className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Nuevo Usuario</p>
                  <p className="text-xs text-muted-foreground">Gestionar cuentas</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2" asChild>
              <Link to="/laboratories">
                <Beaker className="h-6 w-6 text-secondary" />
                <div className="text-left">
                  <p className="font-semibold">Ver Laboratorios</p>
                  <p className="text-xs text-muted-foreground">Explorar disponibilidad</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2" asChild>
              <Link to="/settings">
                <Settings className="h-6 w-6 text-accent" />
                <div className="text-left">
                  <p className="font-semibold">Configuración</p>
                  <p className="text-xs text-muted-foreground">Parámetros del sistema</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4 gap-2" asChild>
              <Link to="/reports">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Reportes</p>
                  <p className="text-xs text-muted-foreground">Ver estadísticas</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
