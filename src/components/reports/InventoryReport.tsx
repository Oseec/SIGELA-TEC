// src/components/reports/InventoryReport.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/useReports";
import { exportToPDF} from "@/lib/exportToPDF";
import { exportToExcel} from "@/lib/exportToExcel";

export default function InventoryReport({ onClose }: { onClose: () => void }) {
  const { inventory } = useReports();

  if (inventory.isLoading) return <p className="text-center py-8">Cargando...</p>;
  if (inventory.isError) return <p className="text-red-500">Error: {inventory.error.message}</p>;

  const columns = ["Nombre", "Tipo", "Stock", "Punto Reorden", "Crítico", "Consumo 30d"] as const;
  type ColumnKey = typeof columns[number];

  const data = inventory.data?.map(r => ({
    Nombre: r.nombre,
    Tipo: r.tipo,
    Stock: r.stock_actual,
    "Punto Reorden": r.punto_reorden,
    Crítico: r.critico ? "Sí" : "No",
    "Consumo 30d": r.consumo_ultimos_30_dias
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
                <TableCell key={col}>
                  {col === "Crítico" ? (
                    <Badge variant={row[col] === "Sí" ? "destructive" : "secondary"}>
                      {row[col]}
                    </Badge>
                  ) : (
                    row[col]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex gap-2">
        <Button onClick={() => exportToPDF("Reporte_Inventario", columns, data)}>
          PDF
        </Button>
        <Button onClick={() => exportToExcel("Reporte_Inventario", data)}>
          Excel
        </Button>
      </div>
    </div>
  );
}