// src/components/RequestCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import DeliveryModal from "./DeliveryModal";
import ReturnModal from "./ReturnModal";
import RequirementCheck from "./RequirementCheck";
import { format } from "date-fns";
import { Package } from "lucide-react";
import { Request } from "@/hooks/useApprovedRequests";

export default function RequestCard({ request }: { request: Request }) {
  const [showDelivery, setShowDelivery] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const inicio = format(new Date(request.fecha_hora_inicio), "dd MMM, HH:mm");
  const fin = format(new Date(request.fecha_hora_fin), "dd MMM, HH:mm");

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {request.usuario_id.nombre_completo}
          </CardTitle>
          <Badge variant="secondary">{request.estado}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {request.laboratorio_id.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Recursos */}
        <div>
          <p className="text-sm font-medium flex items-center gap-1">
            <Package className="h-4 w-4" />
            Recursos solicitados:
          </p>
          <ul className="ml-5 mt-1 text-sm text-muted-foreground">
            {request.recursos_solicitados.map((r, i) => (
              <li key={i}>
                • {r.nombre} (Cantidad: {r.cantidad})
              </li>
            ))}
          </ul>
        </div>

        {/* Fechas */}
        <div className="text-sm">
          <p className="font-medium">Período de uso:</p>
          <p className="text-muted-foreground">
            {inicio} → {fin}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={() => setShowCheck(true)}>
            Validar Requisitos
          </Button>
          <Button size="sm" variant="default" onClick={() => setShowDelivery(true)}>
            Entregar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowReturn(true)}>
            Devolver
          </Button>
        </div>
      </CardContent>

      {/* Modales */}
      <RequirementCheck
        isOpen={showCheck}
        onClose={() => setShowCheck(false)}
        usuarioId={request.usuario_id.id}
        laboratorioId={request.laboratorio_id.id}
      />
      <DeliveryModal
        isOpen={showDelivery}
        onClose={() => setShowDelivery(false)}
        solicitudId={request.id}
      />
      <ReturnModal
        isOpen={showReturn}
        onClose={() => setShowReturn(false)}
        solicitudId={request.id}
      />
    </Card>
  );
}