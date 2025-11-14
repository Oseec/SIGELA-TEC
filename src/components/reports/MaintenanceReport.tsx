// src/components/reports/MaintenanceReport.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/useReports";
import { exportToPDF } from "@/lib/exportToPDF";
import { exportToExcel } from "@/lib/exportToExcel";

export default function MaintenanceReport({ onClose }: { onClose: () => void }) {
  const { maintenance } = useReports();

  if (maintenance.isLoading) return <p className="text-center py-8">Cargando...</p>;
  if (maintenance.isError) return <p className="text-red-500">Error: {maintenance.error.message}</p>;

  const columns = ["Recurso", "Mantenimientos", "Tiempo Promedio (días)", "Última Fecha"] as const;
  type ColumnKey = typeof columns[number];

  const data = maintenance.data?.map(m => ({
    Recurso: m.recurso_nombre,
    Mantenimientos: m.total_mantenimientos,
    "Tiempo Promedio (días)": m.tiempo_promedio_fuera_dias,
    "Última Fecha": m.ultima_fecha
  })) || [];

  return (
    <div className="space-y-4">
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
        <Button onClick={() => exportToPDF("Reporte_Mantenimiento", columns, data)}>
          PDF
        </Button>
        <Button onClick={() => exportToExcel("Reporte_Mantenimiento", data)}>
          Excel
        </Button>
      </div>
    </div>
  );
}