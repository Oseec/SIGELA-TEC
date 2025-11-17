// src/components/lab/ResourceCatalog.tsx
import { useLabAdmin } from '@/hooks/useLabAdmin';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Bell, Plus } from 'lucide-react';

type FotoRecurso = {
  id: string;
  url: string;
  es_principal: boolean;
};

type Recurso = {
  id: number;
  nombre: string;
  codigo_inventario: string;
  estado: string;
  cantidad_total: number | null;
  unidad_medida: string | null;
  tipo: string;
  fotos: string[] | null;           
  foto_recurso: FotoRecurso[] | null; 
};

export default function ResourceCatalog() {
  const { laboratorio } = useLabAdmin();

  const { data: recursos = [] } = useQuery<Recurso[]>({
    queryKey: ['recursos_catalogo', laboratorio?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('recurso')
        .select(`
          id,
          nombre,
          codigo_inventario,
          estado,
          cantidad_total,
          unidad_medida,
          tipo,
          fotos,
          foto_recurso (id, url, es_principal)
        `)
        .eq('laboratorio_id', laboratorio!.id)
        .order('nombre');

      return data ?? [];
    },
    enabled: !!laboratorio?.id,
  });

  const getEstadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      disponible: 'bg-green-100 text-green-800',
      en_mantenimiento: 'bg-yellow-100 text-yellow-800',
      reservado: 'bg-blue-100 text-blue-800',
      inactivo: 'bg-red-100 text-red-800',
    };
    return map[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recursos.map((recurso) => {
        // Prioridad: foto principal de foto_recurso → cualquier foto_recurso → fotos JSONB → nada
        const fotoPrincipal =
          recurso.foto_recurso?.find((f) => f.es_principal)?.url ??
          recurso.foto_recurso?.[0]?.url ??
          (Array.isArray(recurso.fotos) && recurso.fotos[0]) ??
          null;

        return (
          <Card key={recurso.id} className="overflow-hidden hover:shadow-lg transition">
            <div className="h-48 bg-gray-100 relative">
              {fotoPrincipal ? (
                <img
                  src={fotoPrincipal}
                  alt={recurso.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Camera className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <Badge className={`absolute top-3 right-3 ${getEstadoBadge(recurso.estado)}`}>
                {recurso.estado.replace(/_/g, ' ')}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{recurso.nombre}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Código: {recurso.codigo_inventario}
              </p>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium capitalize">
                  Tipo: {recurso.tipo}
                </p>
                {recurso.cantidad_total !== null && (
                  <p className="text-sm">
                    Disponibles: {recurso.cantidad_total} {recurso.unidad_medida || ''}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Solicitar
                  </Button>
                  {recurso.estado !== 'disponible' && (
                    <Button variant="outline" size="icon">
                      <Bell className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}