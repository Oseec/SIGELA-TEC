import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useMaintenance } from "@/hooks/useMaintenance";

export default function Maintenance() {
  const { data: maintenance, isLoading } = useMaintenance();

  if (isLoading) return <p>Cargando calendario...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/dashboard">← Volver</Link>
      </Button>

      <h1 className="text-3xl font-bold">Calendario de Mantenimiento</h1>
      <p className="text-muted-foreground">
        Lista completa de mantenimientos programados y realizados.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Mantenimientos registrados
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {maintenance?.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition"
            >
              <p className="font-semibold">{m.equipment}</p>
              <p className="text-sm text-muted-foreground">{m.lab}</p>

              <div className="flex items-center gap-2 text-xs mt-2">
                <Calendar className="h-3 w-3" />
                {m.date ? m.date : "Sin fecha programada"}
                {m.dateReal && <span>• Realizado: {m.dateReal}</span>}
              </div>

              <p className="text-xs mt-2">
                <strong>Tipo:</strong> {m.tipo}
              </p>

              <div className="flex items-center gap-2 text-xs mt-1">
                <User className="h-3 w-3" />
                Técnico: {m.technician}
              </div>

              {m.details && (
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Detalles:</strong> {m.details}
                </p>
              )}
            </div>
          ))}

          {maintenance?.length === 0 && (
            <p className="text-muted-foreground text-sm">No hay mantenimientos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
