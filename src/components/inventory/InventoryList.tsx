// src/components/inventory/InventoryList.tsx
import { useResources } from "@/hooks/useResources";
import ResourceCard from "./ResourceCard";
import ResourceForm from "./ResourceForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Resource } from "@/hooks/useResources";

export default function InventoryList() {
  const { resources, isLoading, upsert, remove } = useResources();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null); // TIPO EXPLÍCITO

  if (isLoading) return <p className="text-center py-8">Cargando inventario...</p>;

  return (
    <>
      <div className="flex justify-between mb-4 items-center">
        <h3 className="text-xl font-semibold">Inventario Actual</h3>
        <Button 
          onClick={() => { 
            setEditing(null); 
            setFormOpen(true); 
          }}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Recurso
        </Button>
      </div>

      {resources && resources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              onEdit={() => { 
                setEditing(r); 
                setFormOpen(true); 
              }}
              onDelete={() => remove.mutate(r.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No hay recursos en el inventario.
        </p>
      )}

      <ResourceForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        resource={editing}
        onSave={(data) => {
          upsert.mutate(data);
          setEditing(null);
        }}
      />
    </>
  );
}