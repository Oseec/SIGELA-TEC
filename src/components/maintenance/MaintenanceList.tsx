// src/components/maintenance/MaintenanceList.tsx
import { useState } from "react";
import { useMaintenances } from "@/hooks/useMaintenances";
import MaintenanceCard from "./MaintenanceCard";
import MaintenanceForm from "./MaintenanceForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

interface ScheduleData {
  recurso_id: number;
  tipo: 'preventivo' | 'correctivo';
  fecha: string;
}

export default function MaintenanceList() {
  const { maintenances, isLoading, schedule, complete } = useMaintenances();
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [labFilter, setLabFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filtros
  const filtered = maintenances?.filter(m => {
    const matchesSearch = m.recurso.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesLab = labFilter === "all" || m.recurso.laboratorio.nombre === labFilter;
    const matchesDateFrom = !dateFrom || new Date(m.fecha_programada) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(m.fecha_programada) <= new Date(dateTo);
    return matchesSearch && matchesLab && matchesDateFrom && matchesDateTo;
  });

  // Laboratorios únicos
  const labs = Array.from(new Set(maintenances?.map(m => m.recurso.laboratorio.nombre) || []));

  const handleSchedule = (data: ScheduleData) => {
    schedule.mutate(data);
  };

  const handleComplete = (id: number) => {
    const detalles = prompt("Detalles del mantenimiento:");
    if (!detalles) return;
    const repuestos = prompt("Repuestos usados (opcional):") || "";
    const isAvailable = confirm("¿El equipo queda DISPONIBLE?");
    const estado = isAvailable ? "disponible" : "inactivo";
    complete.mutate({ id, detalles, repuestos, estado });
  };

  if (isLoading) return <p>Cargando mantenimientos...</p>;

  return (
    <>
      {/* FILTROS */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por equipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={labFilter} onValueChange={setLabFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Laboratorio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {labs.map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="Desde" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="Hasta" />
        </div>
      </div>

      {/* BOTÓN PROGRAMAR */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Mantenimientos</h3>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Programar
        </Button>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        {filtered?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No hay mantenimientos que coincidan</p>
        ) : (
          filtered?.map(m => (
            <MaintenanceCard
              key={m.id}
              maintenance={m}
              onComplete={handleComplete}
            />
          ))
        )}
      </div>

      <MaintenanceForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSchedule}
      />
    </>
  );
}