// src/components/lab/LabHistory.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabAdmin } from "@/hooks/useLabAdmin";

export default function LabHistory() {
  const { bitacora } = useLabAdmin();

  if (bitacora.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Historial</CardTitle></CardHeader>
        <CardContent className="text-center text-muted-foreground">
          No hay actividad reciente
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial del Laboratorio</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bitacora.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.fecha_hora).toLocaleString()}</TableCell>
                <TableCell>{entry.nombre_usuario}</TableCell>
                <TableCell>{entry.accion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}