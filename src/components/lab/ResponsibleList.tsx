// src/components/lab/ResponsibleList.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Phone } from "lucide-react";
import { useLabAdmin } from "@/hooks/useLabAdmin";

export default function ResponsibleList() {
  const { responsables } = useLabAdmin();

  if (responsables.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Responsables</CardTitle></CardHeader>
        <CardContent className="text-center text-muted-foreground">
          No hay responsables registrados
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Responsables del Laboratorio</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Teléfono</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responsables.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {r.nombre_completo}
                </TableCell>
                <TableCell>{r.cargo}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {r.telefono || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}