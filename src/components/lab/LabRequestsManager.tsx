// src/components/lab/LabRequestsManager.tsx
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useLabAdmin } from '@/hooks/useLabAdmin';
import { toast } from '@/components/ui/sonner';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertCircle, CheckCircle, XCircle, Clock, Search, Filter,
  FileText, User, Calendar, PackageSearch, AlertTriangle,
  Info, ChevronDown, ChevronUp, MessageSquare, Eye, Package,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ============= TIPOS =============
type EstadoSolicitud = 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada';

interface SolicitudDB {
  id: number;
  usuario_id: string;
  laboratorio_id?: number; // la tratamos como opcional por ahora
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  motivo: string;
  estado: EstadoSolicitud;
  recursos_solicitados: any;
  documentos?: string[];
  creado_en: string;
  motivo_rechazo?: string;
  //observaciones?: string;
}

// ============= TIPOS DE SALIDA DEL HOOK =============
interface SolicitudEnriquecida extends SolicitudDB {
  usuario: {
    id: string;
    nombre: string;
    carnet: string;
    carrera: string;
    email: string;
    telefono: string;
    cumpleRequisitos: boolean;
    requisitosIncumplidos: any[];
  };
  recursos: {
    id: number;
    nombre: string;
    tipo: string;
    cantidad: number;
    disponible: boolean;
    stockActual?: number;
  }[];
}

// ============= HOOK PRINCIPAL =============
export function useLabRequests() {
  const { laboratorio } = useLabAdmin();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener solicitudes
  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['lab_requests', laboratorio?.id],
    queryFn: async () => {
      if (!laboratorio?.id) return [];

      const { data, error } = await supabase
        .from('solicitud')
        .select(`
          id, usuario_id, fecha_hora_inicio, fecha_hora_fin,
          motivo, estado, recursos_solicitados, documentos,
          creado_en, motivo_rechazo
        `)
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error cargando solicitudes', error);
        throw error;
      }

      const baseSolicitudes = (data ?? []) as SolicitudDB[];

      // 1) Usuarios relacionados
      const userIds = [...new Set(baseSolicitudes.map(s => s.usuario_id))].filter(Boolean);

      const { data: usuarios } =
        userIds.length > 0
          ? await supabase
              .from('vw_perfil_usuario')
              .select('id, correo, nombre_completo, carnet_o_codigo, rol, carrera_id, telefono, certificaciones')
              .in('id', userIds)
          : { data: [] as any[] };

      // 2) Recursos relacionados
      const recursosIds = [
        ...new Set(
          baseSolicitudes.flatMap(s =>
            (s.recursos_solicitados || []).map((r: any) => r.recurso_id)
          )
        ),
      ].filter(Boolean);

      const { data: recursos } =
        recursosIds.length > 0
          ? await supabase
              .from('recurso')
              .select('id, nombre, tipo, estado, cantidad_total')
              .in('id', recursosIds)
          : { data: [] as any[] };

      // 3) Enriquecer solicitudes con usuario y recursos
      return baseSolicitudes.map((solicitud) => {
        const usuario = usuarios?.find(u => u.id === solicitud.usuario_id);

        const recursosInfo = (solicitud.recursos_solicitados || []).map((rs: any) => {
          const recurso = recursos?.find(r => r.id === rs.recurso_id);
          return {
            id: rs.recurso_id,
            nombre: recurso?.nombre || 'Recurso desconocido',
            tipo: recurso?.tipo || 'equipo',
            cantidad: rs.cantidad || 1,
            disponible: recurso?.estado === 'disponible',
            stockActual: recurso?.cantidad_total,
          };
        });

        return {
          ...solicitud,
          usuario: {
            id: usuario?.id || '',
            nombre: usuario?.nombre_completo || 'Usuario desconocido',
            carnet: usuario?.carnet_o_codigo || '',
            carrera: usuario?.carrera || '',
            email: usuario?.email || '',
            telefono: usuario?.telefono || '',
            cumpleRequisitos: true,
            requisitosIncumplidos: [],
          },
          recursos: recursosInfo,
        };
      });
    },
    enabled: !!laboratorio?.id,
  });


  // Aprobar solicitud
const aprobar = useMutation({
  mutationFn: async ({ 
    solicitudId, 
    observaciones 
  }: { 
    solicitudId: number; 
    observaciones?: string;
  }) => {
    // 1. Actualizar solicitud (sin columna observaciones)
    const { error: updateError } = await supabase
      .from('solicitud')
      .update({ 
        estado: 'aprobada',
        aprobado_por: user?.id,   // asumiendo que esta columna sí existe
      })
      .eq('id', solicitudId);

    if (updateError) throw updateError;

    // 2. Obtener datos de la solicitud para bitácora
    const { data: solicitud } = await supabase
      .from('solicitud')
      .select('usuario_id, recursos_solicitados, fecha_hora_inicio')
      .eq('id', solicitudId)
      .single();

    // 3. Registrar en bitácora (aquí sí podemos guardar observaciones en el JSON)
    await supabase.from('bitacora').insert({
      usuario_id: user?.id,
      accion: 'solicitud_aprobada',
      tabla_afectada: 'solicitud',
      registro_id: solicitudId, // int4, mejor que mandar string
      detalles: {
        solicitud_id: solicitudId,
        usuario_solicitante_id: solicitud?.usuario_id,
        fecha_uso: solicitud?.fecha_hora_inicio,
        recursos: solicitud?.recursos_solicitados,
        observaciones, // se guarda solo dentro del jsonb
      },
      fecha_hora: new Date().toISOString(),
    });

      // 4. Actualizar calendario (crear bloque reservado)
      if (solicitud) {
        await supabase.from('horario_laboratorio').insert({
          laboratorio_id: laboratorio!.id,
          fecha: solicitud.fecha_hora_inicio.split('T')[0],
          hora_inicio: solicitud.fecha_hora_inicio.split('T')[1],
          hora_fin: solicitud.fecha_hora_inicio.split('T')[1], // usar hora_fin real
          estado: 'reservado',
          solicitud_id: solicitudId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab_requests'] });
      queryClient.invalidateQueries({ queryKey: ['bitacora'] });
      toast.success('Solicitud aprobada correctamente');
    },
    onError: (error) => {
      console.error('Error al aprobar:', error);
      toast.error('No se pudo aprobar la solicitud');
    },
  });

  // Rechazar solicitud
  const rechazar = useMutation({
    mutationFn: async ({ 
      solicitudId, 
      motivo 
    }: { 
      solicitudId: number; 
      motivo: string;
    }) => {
      const { error } = await supabase
        .from('solicitud')
        .update({ 
          estado: 'rechazada',
          motivo_rechazo: motivo,
        })
        .eq('id', solicitudId);

      if (error) throw error;

      // Registrar en bitácora
      await supabase.from('bitacora').insert({
        usuario_id: user?.id,
        accion: 'solicitud_rechazada',
        tabla_afectada: 'solicitud',
        registro_id: solicitudId.toString(),
        detalles: {
          solicitud_id: solicitudId,
          motivo_rechazo: motivo,
        },
        fecha_hora: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab_requests'] });
      queryClient.invalidateQueries({ queryKey: ['bitacora'] });
      toast.success('Solicitud rechazada');
    },
    onError: () => {
      toast.error('No se pudo rechazar la solicitud');
    },
  });

// Solicitar información adicional
const solicitarInfo = useMutation({
  mutationFn: async ({ 
    solicitudId, 
    mensaje 
  }: { 
    solicitudId: number; 
    mensaje: string;
  }) => {
    // Actualizar solo el estado, sin columna observaciones
    const { error } = await supabase
      .from('solicitud')
      .update({ 
        estado: 'en_revision',
      })
      .eq('id', solicitudId);

    if (error) throw error;

    // Registrar en bitácora
    await supabase.from('bitacora').insert({
      usuario_id: user?.id,
      accion: 'solicitud_en_revision',
      tabla_afectada: 'solicitud',
      registro_id: solicitudId, // int4
      detalles: {
        solicitud_id: solicitudId,
        mensaje_revision: mensaje,
      },
      fecha_hora: new Date().toISOString(),
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['lab_requests'] });
    queryClient.invalidateQueries({ queryKey: ['bitacora'] });
    toast.success('Solicitud de información enviada');
  },
  onError: () => {
    toast.error('No se pudo enviar la solicitud');
  },
});


  return {
    solicitudes,
    isLoading,
    aprobar,
    rechazar,
    solicitarInfo,
  };
}

// ============= COMPONENTE DE DETALLE =============
function SolicitudDetail({ solicitud }: { solicitud: any }) {
  const [expanded, setExpanded] = useState({
    usuario: true,
    detalles: true,
    recursos: true,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-4">
      {/* Usuario */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-accent/50"
          onClick={() => toggleSection('usuario')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Solicitante
            </CardTitle>
            {expanded.usuario ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expanded.usuario && (
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <p className="font-medium">{solicitud.usuario.nombre}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Carné</Label>
              <p className="font-medium">{solicitud.usuario.carnet}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Carrera</Label>
              <p className="font-medium">{solicitud.usuario.carrera}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium text-sm">{solicitud.usuario.email}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Detalles */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-accent/50"
          onClick={() => toggleSection('detalles')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Detalles de la Reserva
            </CardTitle>
            {expanded.detalles ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expanded.detalles && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Fecha y hora</Label>
                <p className="font-medium">
                  {format(new Date(solicitud.fecha_hora_inicio), "d 'de' MMMM, HH:mm", { locale: es })}
                  {' - '}
                  {format(new Date(solicitud.fecha_hora_fin), "HH:mm")}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Objetivo</Label>
              <p className="mt-1 text-sm">{solicitud.motivo}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recursos */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-accent/50"
          onClick={() => toggleSection('recursos')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <PackageSearch className="h-4 w-4" />
              Recursos Solicitados ({solicitud.recursos?.length || 0})
            </CardTitle>
            {expanded.recursos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {expanded.recursos && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Disponibilidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitud.recursos?.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{r.tipo}</Badge>
                    </TableCell>
                    <TableCell>{r.cantidad}</TableCell>
                    <TableCell>
                      {r.disponible ? (
                        <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">No disponible</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ============= COMPONENTE PRINCIPAL =============
export default function LabRequestsManager() {
  const { solicitudes, isLoading, aprobar, rechazar, solicitarInfo } = useLabRequests();
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'aprobar' | 'rechazar' | 'revisar' | null>(null);
  
  // Estados de filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Estados para formularios
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [informacionAdicional, setInformacionAdicional] = useState('');
  const [observacionesAprobacion, setObservacionesAprobacion] = useState('');

  // Filtrado
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(s => {
      const matchSearch = 
        s.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.usuario.carnet.includes(searchTerm) ||
        s.motivo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchEstado = filtroEstado === 'todos' || s.estado === filtroEstado;
      
      return matchSearch && matchEstado;
    });
  }, [solicitudes, searchTerm, filtroEstado]);

  // Agrupación por estado
  const solicitudesPorEstado = {
    pendiente: solicitudesFiltradas.filter(s => s.estado === 'pendiente'),
    en_revision: solicitudesFiltradas.filter(s => s.estado === 'en_revision'),
    aprobada: solicitudesFiltradas.filter(s => s.estado === 'aprobada'),
    rechazada: solicitudesFiltradas.filter(s => s.estado === 'rechazada'),
  };

  const openActionDialog = (solicitud: any, action: 'aprobar' | 'rechazar' | 'revisar') => {
    setSelectedSolicitud(solicitud);
    setActionType(action);
    setDialogOpen(true);
    setMotivoRechazo('');
    setInformacionAdicional('');
    setObservacionesAprobacion('');
  };

  const handleAction = async () => {
    if (!selectedSolicitud || !actionType) return;
    
    try {
      if (actionType === 'aprobar') {
        await aprobar.mutateAsync({
          solicitudId: selectedSolicitud.id,
          observaciones: observacionesAprobacion,
        });
      } else if (actionType === 'rechazar') {
        if (!motivoRechazo.trim()) {
          toast.error('Debes indicar el motivo del rechazo');
          return;
        }
        await rechazar.mutateAsync({
          solicitudId: selectedSolicitud.id,
          motivo: motivoRechazo,
        });
      } else if (actionType === 'revisar') {
        if (!informacionAdicional.trim()) {
          toast.error('Debes indicar qué información se requiere');
          return;
        }
        await solicitarInfo.mutateAsync({
          solicitudId: selectedSolicitud.id,
          mensaje: informacionAdicional,
        });
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error en acción:', error);
    }
  };

  const getEstadoBadge = (estado: EstadoSolicitud) => {
    const config = {
      pendiente: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      en_revision: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
      aprobada: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      rechazada: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    }[estado];
    
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.bg} ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {estado.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold">Gestión de Solicitudes y Reservas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revisa, aprueba o rechaza solicitudes de uso del laboratorio
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, carné, objetivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_revision">En revisión</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por estado */}
      <Tabs defaultValue="pendiente" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pendiente">
            <Clock className="h-4 w-4 mr-2" />
            Pendientes ({solicitudesPorEstado.pendiente.length})
          </TabsTrigger>
          <TabsTrigger value="en_revision">
            <AlertCircle className="h-4 w-4 mr-2" />
            En Revisión ({solicitudesPorEstado.en_revision.length})
          </TabsTrigger>
          <TabsTrigger value="aprobada">
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprobadas ({solicitudesPorEstado.aprobada.length})
          </TabsTrigger>
          <TabsTrigger value="rechazada">
            <XCircle className="h-4 w-4 mr-2" />
            Rechazadas ({solicitudesPorEstado.rechazada.length})
          </TabsTrigger>
        </TabsList>

        {(['pendiente', 'en_revision', 'aprobada', 'rechazada'] as EstadoSolicitud[]).map(estado => (
          <TabsContent key={estado} value={estado}>
            {solicitudesPorEstado[estado].length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay solicitudes en este estado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {solicitudesPorEstado[estado].map(solicitud => (
                  <Card key={solicitud.id} className="hover:shadow-md transition">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Solicitud #{solicitud.id} - {solicitud.usuario.nombre}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(solicitud.fecha_hora_inicio), "d 'de' MMMM, HH:mm", { locale: es })}
                            {' - '}
                            {format(new Date(solicitud.fecha_hora_fin), "HH:mm")}
                          </CardDescription>
                        </div>
                        {getEstadoBadge(solicitud.estado)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Objetivo</Label>
                          <p className="text-sm mt-1">{solicitud.motivo}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-muted-foreground">
                            Recursos: {solicitud.recursos?.length || 0}
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalles
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalles de la Solicitud</DialogTitle>
                                </DialogHeader>
                                <SolicitudDetail solicitud={solicitud} />
                                
                                {solicitud.estado === 'pendiente' && (
                                  <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                      onClick={() => {
                                        setSelectedSolicitud(solicitud);
                                        openActionDialog(solicitud, 'aprobar');
                                      }}
                                      className="flex-1"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Aprobar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => openActionDialog(solicitud, 'revisar')}
                                      className="flex-1"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Solicitar Info
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => openActionDialog(solicitud, 'rechazar')}
                                      className="flex-1"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Rechazar
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog de acciones */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'aprobar' && 'Aprobar Solicitud'}
              {actionType === 'rechazar' && 'Rechazar Solicitud'}
              {actionType === 'revisar' && 'Solicitar Información'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'aprobar' && (
              <>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium text-green-900">Aprobar solicitud</p>
                  <p className="text-sm text-green-700">
                    Se actualizará el calendario y se reservarán los recursos
                  </p>
                </div>
                <div>
                  <Label>Observaciones (opcional)</Label>
                  <Textarea
                    value={observacionesAprobacion}
                    onChange={(e) => setObservacionesAprobacion(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {actionType === 'rechazar' && (
              <>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-medium text-red-900">Rechazar solicitud</p>
                  <p className="text-sm text-red-700">
                    El usuario recibirá una notificación con el motivo
                  </p>
                </div>
                <div>
                  <Label>Motivo del rechazo *</Label>
                  <Textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    rows={4}
                    placeholder="Explica por qué se rechaza..."
                  />
                </div>
              </>
            )}

            {actionType === 'revisar' && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900">Solicitar información adicional</p>
                  <p className="text-sm text-blue-700">
                    La solicitud quedará en revisión hasta recibir respuesta
                  </p>
                </div>
                <div>
                  <Label>¿Qué información necesitas? *</Label>
                  <Textarea
                    value={informacionAdicional}
                    onChange={(e) => setInformacionAdicional(e.target.value)}
                    rows={4}
                    placeholder="Describe qué información adicional se requiere..."
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                (actionType === 'rechazar' && !motivoRechazo.trim()) ||
                (actionType === 'revisar' && !informacionAdicional.trim()) ||
                aprobar.isPending ||
                rechazar.isPending ||
                solicitarInfo.isPending
              }
              variant={actionType === 'rechazar' ? 'destructive' : 'default'}
            >
              {aprobar.isPending || rechazar.isPending || solicitarInfo.isPending ? (
                'Procesando...'
              ) : (
                <>
                  {actionType === 'aprobar' && 'Aprobar Solicitud'}
                  {actionType === 'rechazar' && 'Rechazar Solicitud'}
                  {actionType === 'revisar' && 'Enviar Solicitud'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}