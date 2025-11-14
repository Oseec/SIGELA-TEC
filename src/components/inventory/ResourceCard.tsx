import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, Wrench } from "lucide-react";
import { Resource } from "@/hooks/useResources";
import MovementLog from "./MovementLog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface Props {
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ResourceCard({ resource, onEdit, onDelete }: Props) {
  const bajoStock = resource.cantidad_disponible <= resource.punto_reorden;

  return (
    <Card className={bajoStock ? "border-red-500" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{resource.nombre}</CardTitle>
          <Badge 
            variant={
                resource.estado === 'disponible' ? 'default' :
                resource.estado === 'reservado' ? 'secondary' :
                resource.estado === 'en_mantenimiento' ? 'outline' : 'destructive'
            }
            className="text-xs"
            >
            {resource.estado.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Código: {resource.codigo_inventario}</p>
        <p className="text-sm">Tipo: {resource.tipo}</p>
        <p className="text-sm">
          Disponible: <strong>{resource.cantidad_disponible}</strong> / {resource.cantidad_total}
          {resource.unidad_medida && ` ${resource.unidad_medida}`}
        </p>
        <p className="text-sm text-muted-foreground">
            Ubicación: <strong>{resource.laboratorio.ubicacion}</strong> ({resource.laboratorio.nombre})
        </p>
        {bajoStock && (
          <p className="text-red-600 flex items-center gap-1 mt-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            Stock bajo
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <button onClick={onEdit} className="text-blue-600 text-sm">Editar</button>
          <button onClick={onDelete} className="text-red-600 text-sm">Baja</button>
        </div>
        <div className="mt-3 pt-3 border-t">
            <MovementLog recursoId={resource.id} />
        </div>
      </CardContent>
    </Card>
  );
}