// src/components/lab/LabProfileForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { useLabAdmin } from "@/hooks/useLabAdmin";

const schema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres"),
  codigo: z.string().min(3, "Mínimo 3 caracteres"),
  ubicacion: z.string().min(5, "Describe la ubicación"),
  descripcion: z.string().nullable(),
  capacidad_maxima: z.coerce.number().min(1),
});

type FormData = z.infer<typeof schema>;

export default function LabProfileForm() {
  const { laboratorio, updateLab, isUpdating } = useLabAdmin();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: laboratorio ? {
      nombre: laboratorio.nombre,
      codigo: laboratorio.codigo,
      ubicacion: laboratorio.ubicacion,
      descripcion: laboratorio.descripcion || "",
      capacidad_maxima: laboratorio.capacidad_maxima,
    } : undefined,
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateLab(data);
      toast.success("Perfil del laboratorio actualizado");
    } catch {
      toast.error("Error al guardar los cambios");
    }
  };

  if (!laboratorio) return <p className="text-muted-foreground">Cargando perfil...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input {...register("nombre")} />
          {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Código</Label>
          <Input {...register("codigo")} />
          {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Ubicación</Label>
          <Input {...register("ubicacion")} />
          {errors.ubicacion && <p className="text-sm text-destructive">{errors.ubicacion.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Capacidad máxima</Label>
          <Input type="number" {...register("capacidad_maxima")} />
          {errors.capacidad_maxima && <p className="text-sm text-destructive">{errors.capacidad_maxima.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea {...register("descripcion")} rows={4} />
      </div>

      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </form>
  );
}