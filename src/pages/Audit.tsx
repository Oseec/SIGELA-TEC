import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useBitacora } from "@/hooks/useBitacora";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Audit() {
  const [userFilter, setUserFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading } = useBitacora({ userFilter, moduleFilter, page, limit });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  // ========== EXPORTAR CSV ==========
  const exportCSV = () => {
    const headers = ["Usuario", "Módulo", "Acción", "Detalles", "Fecha"];

    const csvRows = rows.map(a => [
      a.perfil_usuario?.nombre_completo ?? "—",
      a.tabla_afectada,
      a.accion,
      JSON.stringify(a.detalles ?? {}),
      new Date(a.fecha_hora).toLocaleString("es-CR"),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," +
      [headers, ...csvRows].map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "auditoria.csv";
    link.click();
  };

  // ========== EXPORTAR EXCEL ==========
  const exportExcel = () => {
    const xlsRows = rows.map(a => ({
      Usuario: a.perfil_usuario?.nombre_completo ?? "—",
      Modulo: a.tabla_afectada,
      Acción: a.accion,
      Detalles: JSON.stringify(a.detalles ?? {}),
      Fecha: new Date(a.fecha_hora).toLocaleString("es-CR"),
    }));

    const ws = XLSX.utils.json_to_sheet(xlsRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Auditoría");

    XLSX.writeFile(wb, "auditoria.xlsx");
  };

  // ========== EXPORTAR PDF ==========
  const exportPDF = () => {
    const doc = new jsPDF();

    const tableData = rows.map(a => [
      a.perfil_usuario?.nombre_completo ?? "—",
      a.tabla_afectada,
      a.accion,
      JSON.stringify(a.detalles ?? {}),
      new Date(a.fecha_hora).toLocaleString("es-CR"),
    ]);

    autoTable(doc, {
      head: [["Usuario", "Módulo", "Acción", "Detalles", "Fecha"]],
      body: tableData,
      styles: { fontSize: 8 },

      columnStyles: {
        0: { cellWidth: 30 }, // Usuario
        1: { cellWidth: 25 }, // Módulo
        2: { cellWidth: 42 }, // Acción
        3: { cellWidth: 65 }, // Detalles
        4: { cellWidth: 20 }, // Fecha
      },
    });

    doc.save("auditoria.pdf");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Auditoría del Sistema
        </h1>
        <p className="text-muted-foreground">
          Registro completo de actividades y cambios en el sistema
        </p>
      </div>

      {/* === BOTONES DE EXPORTACIÓN === */}
      <div className="flex gap-3">
        <Button onClick={exportCSV}>Exportar CSV</Button>
        <Button onClick={exportExcel}>Exportar Excel</Button>
        <Button onClick={exportPDF}>Exportar PDF</Button>
      </div>

      {/* === FILTROS === */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Auditoría</CardTitle>
          <CardDescription>Filtra las actividades por usuario y módulo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">

            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Usuario</label>
              <Select value={userFilter} onValueChange={value => { setPage(1); setUserFilter(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="docente">Docentes</SelectItem>
                  <SelectItem value="estudiante">Estudiantes</SelectItem>
                  <SelectItem value="tecnico">Técnicos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Módulo</label>
              <Select value={moduleFilter} onValueChange={value => { setPage(1); setModuleFilter(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="solicitud">Reservas</SelectItem>
                  <SelectItem value="recurso">Inventario</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="parametro">Configuración</SelectItem>
                  <SelectItem value="laboratorio">Laboratorios</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* === TABLA === */}
      <Card>
        <CardHeader>
          <CardTitle>Actividades Recientes</CardTitle>
          <CardDescription>Registro cronológico de acciones</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando auditoría...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {a.perfil_usuario?.nombre_completo ?? "Usuario desconocido"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell><Badge variant="outline">{a.tabla_afectada}</Badge></TableCell>
                    <TableCell>{a.accion}</TableCell>
                    <TableCell className="text-sm">{JSON.stringify(a.detalles)}</TableCell>
                    <TableCell className="text-sm">{new Date(a.fecha_hora).toLocaleString("es-CR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && rows.length === 0 && <p className="text-muted-foreground">No hay registros para los filtros seleccionados.</p>}

          {/* === PAGINACIÓN === */}
          <div className="flex justify-between items-center mt-4">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>

            <p>Página {page}</p>

            <Button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>Siguiente</Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
