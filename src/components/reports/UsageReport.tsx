// src/components/reports/UsageReport.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useReports } from "@/hooks/useReports";
import { exportToPDF } from "@/lib/exportToPDF";
import { exportToExcel } from "@/lib/exportToExcel";

export default function UsageReport({ onClose }: { onClose: () => void }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const { usage } = useReports(fechaInicio, fechaFin);

  if (usage.isLoading) return <p className="text-center py-8">Cargando...</p>;
  if (usage.isError) return <p className="text-red-500">Error: {usage.error.message}</p>;

  const columns = ["Recurso", "Entregas", "Usuarios Frecuentes"] as const;
  type ColumnKey = typeof columns[number];

  const data = usage.data?.map(r => ({
    Recurso: r.recurso_nombre,
    Entregas: r.total_entregas,
    "Usuarios Frecuentes": r.usuarios_frecuentes?.join(', ') || 'Ninguno'
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} placeholder="Desde" />
        <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} placeholder="Hasta" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map(col => (
                <TableCell key={col}>{row[col]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex gap-2">
        <Button onClick={() => exportToPDF("Reporte_Uso_Recursos", columns, data)}>
          PDF
        </Button>
        <Button onClick={() => exportToExcel("Reporte_Uso_Recursos", data)}>
          Excel
        </Button>
      </div>
    </div>
  );
}