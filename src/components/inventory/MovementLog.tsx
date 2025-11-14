// src/components/inventory/MovementLog.tsx
import { useMovements } from "@/hooks/useMovements";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, History } from "lucide-react";

interface Props {
  recursoId: number;
}

export default function MovementLog({ recursoId }: Props) {
  const { data: movements, isLoading } = useMovements(recursoId);

  if (isLoading) return <p className="text-xs text-muted-foreground">Cargando movimientos...</p>;

  if (!movements || movements.length === 0) {
    return <p className="text-xs text-muted-foreground">Sin movimientos</p>;
  }

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs h-7">
          <History className="h-3 w-3 mr-1" />
          Ver movimientos ({movements.length})
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-1 text-xs">
        {movements.map(m => (
          <div key={m.id} className="border-l-2 border-muted pl-2 py-1">
            <div className="flex justify-between">
              <span className="font-medium">
                {m.tipo === 'entrada' ? '+' : '-'} {m.cantidad}
              </span>
              <span className="text-muted-foreground">
                {new Date(m.fecha).toLocaleDateString()}
              </span>
            </div>
            <p className="text-muted-foreground">{m.motivo}</p>
            {m.usuario && <p className="text-xs italic">por {m.usuario.nombre_completo}</p>}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}