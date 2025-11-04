import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Plus } from "lucide-react";

export default function Settings() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Configuración de Parámetros Globales
        </h1>
        <p className="text-muted-foreground">Gestiona las reglas y configuraciones del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Reglas de Reserva
          </CardTitle>
          <CardDescription>Define los parámetros para las reservas de recursos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Duración máxima por reserva</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="7" className="w-20" />
                <span className="text-sm text-muted-foreground">días</span>
              </div>
            </div>
            <Button variant="outline">Modificar</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Antelación mínima</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="24" className="w-20" />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
            </div>
            <Button variant="outline">Modificar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estados y Etiquetas</CardTitle>
          <CardDescription>Gestiona los estados disponibles para recursos y reservas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default">Disponible</Badge>
            <Badge variant="secondary">Reservado</Badge>
            <Badge variant="outline">Mantenimiento</Badge>
            <Badge variant="destructive">Inactivo</Badge>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Configura las alertas automáticas del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="reminders">Recordatorios de entrega</Label>
              <p className="text-sm text-muted-foreground">
                Enviar alertas antes del vencimiento de reservas
              </p>
            </div>
            <Switch id="reminders" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="maintenance">Alertas de mantenimiento</Label>
              <p className="text-sm text-muted-foreground">
                Notificar cuando un equipo requiere mantenimiento
              </p>
            </div>
            <Switch id="maintenance" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
