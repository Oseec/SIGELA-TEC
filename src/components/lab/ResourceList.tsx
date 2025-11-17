// src/components/lab/ResourceList.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLabAdmin } from "@/hooks/useLabAdmin";

export default function ResourceList() {
  const { recursos } = useLabAdmin();
  const equipos = recursos.filter(r => r.tipo === 'equipo');
  const consumibles = recursos.filter(r => r.tipo === 'consumible');

  return (
    <Tabs defaultValue="equipos">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="equipos">Equipos ({equipos.length})</TabsTrigger>
        <TabsTrigger value="consumibles">Consumibles ({consumibles.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="equipos">
        <Card>
          <CardHeader><CardTitle>Equipos Fijos</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Mantenimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipos.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.nombre}</TableCell>
                    <TableCell>{e.codigo_inventario}</TableCell>
                    <TableCell><Badge variant={e.estado === 'disponible' ? 'default' : 'secondary'}>{e.estado}</Badge></TableCell>
                    <TableCell>{e.ultima_mantenimiento || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="consumibles">
        <Card>
          <CardHeader><CardTitle>Materiales Consumibles</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Punto Reorden</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumibles.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.cantidad_total}</TableCell>
                    <TableCell>{c.punto_reorden}</TableCell>
                    <TableCell>
                      <Badge variant={c.cantidad_total <= c.punto_reorden ? 'destructive' : 'default'}>
                        {c.cantidad_total <= c.punto_reorden ? 'Crítico' : 'Normal'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}