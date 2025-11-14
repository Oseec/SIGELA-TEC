// src/lib/exportToPDF.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface RowData {
  [key: string]: string | number | boolean;
}

export const exportToPDF = (
  title: string,
  columns: readonly string[],
  data: RowData[]
) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // Aplicar autoTable directamente
  autoTable(doc, {
    head: [Array.from(columns)],
    body: data.map(row => columns.map(col => String(row[col] ?? ''))),
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};