// src/components/lab/LabCalendar.tsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useLabAdmin } from '@/hooks/useLabAdmin';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO } from 'date-fns';

export default function LabCalendar() {
  const { laboratorio } = useLabAdmin();

  const { data: bloques = [] } = useQuery({
    queryKey: ['bloques_laboratorio', laboratorio?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('horario_laboratorio')
        .select('id, fecha, hora_inicio, hora_fin, estado, notas, solicitud_id')
        .eq('laboratorio_id', laboratorio!.id)
        .gte('fecha', new Date().toISOString().split('T')[0]) // solo futuras y hoy
        .order('fecha');

      return data ?? [];
    },
    enabled: !!laboratorio?.id,
  });

  const { data: mantenimientos = [] } = useQuery({
    queryKey: ['mantenimientos_lab', laboratorio?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('mantenimiento')
        .select('id, fecha_programada, detalles')
        .is('recurso_id', null)
        .gte('fecha_programada', new Date().toISOString().split('T')[0]);

      return data ?? [];
    },
    enabled: !!laboratorio?.id,
  });

  const events = [
    // Bloques del horario_laboratorio
    ...bloques.map(b => ({
      id: b.id,
      title: b.estado === 'reservado' ? 'Reservado' : 
             b.estado === 'bloqueado' ? 'Bloqueado' : 'Libre',
      start: `${b.fecha}T${b.hora_inicio}`,
      end: `${b.fecha}T${b.hora_fin}`,
      color: b.estado === 'reservado' ? '#3b82f6' :
             b.estado === 'bloqueado' ? '#ef4444' : '#10b981',
      textColor: 'white',
      extendedProps: { notas: b.notas },
    })),
    // Mantenimientos
    ...mantenimientos.map(m => ({
      title: `Mantenimiento: ${m.detalles || 'Laboratorio'}`,
      start: m.fecha_programada,
      allDay: true,
      color: '#f97316',
      textColor: 'white',
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Calendario de Disponibilidad</h3>
        <p className="text-sm text-gray-600">
          Azul = Reservado · Rojo = Bloqueado · Verde = Libre · Naranja = Mantenimiento
        </p>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        height="700px"
        locale="es"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false
        }}
      />
    </div>
  );
}