import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Beaker,
  Calendar,
  Package,
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Laboratorios Activos",
    value: "24",
    change: "+2 este mes",
    icon: Beaker,
    color: "text-primary",
  },
  {
    title: "Reservas Activas",
    value: "156",
    change: "+18% vs mes anterior",
    icon: Calendar,
    color: "text-secondary",
  },
  {
    title: "Equipos Disponibles",
    value: "342",
    change: "89% disponibilidad",
    icon: Package,
    color: "text-accent",
  },
  {
    title: "Mantenimientos",
    value: "8",
    change: "5 pendientes",
    icon: Wrench,
    color: "text-warning",
  },
];

const recentReservations = [
  {
    id: 1,
    lab: "Laboratorio de Física",
    user: "María González",
    date: "2025-11-05",
    time: "10:00 - 12:00",
    status: "approved",
  },
  {
    id: 2,
    lab: "Laboratorio de Química",
    user: "Carlos Ramírez",
    date: "2025-11-05",
    time: "14:00 - 16:00",
    status: "pending",
  },
  {
    id: 3,
    lab: "Laboratorio de Computación",
    user: "Ana Martínez",
    date: "2025-11-06",
    time: "09:00 - 11:00",
    status: "approved",
  },
];

const upcomingMaintenance = [
  {
    id: 1,
    equipment: "Microscopio Digital HD-2000",
    lab: "Lab. Biología",
    date: "2025-11-08",
    type: "Preventivo",
  },
  {
    id: 2,
    equipment: "Espectrómetro UV-Vis",
    lab: "Lab. Química",
    date: "2025-11-10",
    type: "Correctivo",
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Bienvenido al SIGLA</h1>
        <p className="text-lg opacity-90">Sistema de Gestión de Laboratorios Académicos - TEC</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{reservation.lab}</p>
                    <p className="text-sm text-muted-foreground">{reservation.user}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {reservation.date} • {reservation.time}
                    </div>
                  </div>
                  <Badge
                    variant={reservation.status === "approved" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {reservation.status === "approved" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aprobada
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pendiente
                      </>
                    )}
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
              {upcomingMaintenance.map((maintenance) => (
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
              <Link to="/reservations">
                <Calendar className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Nueva Reserva</p>
                  <p className="text-xs text-muted-foreground">Reservar laboratorio</p>
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
              <Link to="/inventory">
                <Package className="h-6 w-6 text-accent" />
                <div className="text-left">
                  <p className="font-semibold">Inventario</p>
                  <p className="text-xs text-muted-foreground">Consultar equipos</p>
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
