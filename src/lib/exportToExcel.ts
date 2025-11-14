// src/lib/exportToExcel.ts
import * as XLSX from 'xlsx';

interface RowData {
  [key: string]: string | number | boolean;
}

export const exportToExcel = (title: string, data: RowData[]) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
};