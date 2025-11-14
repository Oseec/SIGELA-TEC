// src/components/maintenance/MaintenanceCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Calendar, User } from "lucide-react";
import { Maintenance } from "@/hooks/useMaintenances";

interface Props {
  maintenance: Maintenance;
  onComplete: (id: number) => void;
}

export default function MaintenanceCard({ maintenance, onComplete }: Props) {
  const isDone = !!maintenance.fecha_realizada;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="text-lg">{maintenance.recurso.nombre}</CardTitle>
          <Badge variant={isDone ? "default" : "secondary"}>
            {isDone ? "Completado" : "Programado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><Wrench className="inline h-4 w-4 mr-1" /> {maintenance.tipo}</p>
        <p><Calendar className="inline h-4 w-4 mr-1" /> {maintenance.fecha_programada}</p>
        <p><User className="inline h-4 w-4 mr-1" /> {maintenance.tecnico.nombre_completo}</p>
        <p className="text-muted-foreground">
          Lab: {maintenance.recurso.laboratorio.nombre}
        </p>
        {isDone && (
          <>
            <p className="font-medium mt-3">Resultado:</p>
            <p>{maintenance.detalles}</p>
            {maintenance.repuestos_usados && <p>Repuestos: {maintenance.repuestos_usados}</p>}
            <Badge variant={maintenance.estado_final === 'disponible' ? 'default' : 'destructive'}>
              {maintenance.estado_final}
            </Badge>
          </>
        )}
        {!isDone && (
          <Button size="sm" className="mt-3" onClick={() => onComplete(maintenance.id)}>
            Marcar como Completado
          </Button>
        )}
      </CardContent>
    </Card>
  );
}