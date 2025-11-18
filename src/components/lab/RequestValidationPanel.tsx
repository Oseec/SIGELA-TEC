// src/components/lab/RequestValidationPanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, XCircle, AlertTriangle, Info, 
  User, Calendar, Package, Shield 
} from 'lucide-react';
import { 
  useRequisitosValidation, 
  useRecursosDisponibilidad, 
  useConflictosHorario 
} from '@/hooks/useRequisitosValidation';

interface RequestValidationPanelProps {
  solicitud: {
    id: number;
    usuario_id: string;
    laboratorio_id: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    recursos_solicitados: Array<{ recurso_id: number; cantidad: number }>;
  };
}

/**
 * Panel de validación automática para solicitudes
 * Muestra el estado de cumplimiento de requisitos, disponibilidad de recursos
 * y conflictos de horario
 */
export default function RequestValidationPanel({ solicitud }: RequestValidationPanelProps) {
  // Validar requisitos del usuario
  const { 
    data: validacionRequisitos, 
    isLoading: loadingRequisitos 
  } = useRequisitosValidation(solicitud.usuario_id, solicitud.laboratorio_id);

  // Validar disponibilidad de recursos
  const { 
    data: disponibilidadRecursos = [], 
    isLoading: loadingRecursos 
  } = useRecursosDisponibilidad(
    solicitud.recursos_solicitados,
    solicitud.fecha_hora_inicio,
    solicitud.fecha_hora_fin
  );

  // Validar conflictos de horario
  const { 
    data: conflictosHorario, 
    isLoading: loadingConflictos 
  } = useConflictosHorario(
    solicitud.laboratorio_id,
    solicitud.fecha_hora_inicio,
    solicitud.fecha_hora_fin,
    solicitud.id
  );

  // Determinar si puede aprobarse
  const puedeAprobar = 
    validacionRequisitos?.cumpleRequisitos &&
    disponibilidadRecursos.every(r => r.disponible) &&
    !conflictosHorario?.tieneConflictos;

  const tieneAdvertencias = 
    !puedeAprobar || 
    disponibilidadRecursos.some(r => r.cantidad_disponible < r.cantidad_solicitada * 2);

  if (loadingRequisitos || loadingRecursos || loadingConflictos) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Validando solicitud...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen general */}
      <Card className={
        puedeAprobar 
          ? 'border-green-200 bg-green-50' 
          : tieneAdvertencias 
          ? 'border-orange-200 bg-orange-50'
          : 'border-red-200 bg-red-50'
      }>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            {puedeAprobar ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : tieneAdvertencias ? (
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${
                puedeAprobar 
                  ? 'text-green-900' 
                  : tieneAdvertencias 
                  ? 'text-orange-900' 
                  : 'text-red-900'
              }`}>
                {puedeAprobar 
                  ? 'Solicitud válida - Lista para aprobar' 
                  : tieneAdvertencias
                  ? 'Solicitud con advertencias - Revisar antes de aprobar'
                  : 'Solicitud no puede aprobarse'}
              </p>
              <p className={`text-sm mt-1 ${
                puedeAprobar 
                  ? 'text-green-700' 
                  : tieneAdvertencias 
                  ? 'text-orange-700' 
                  : 'text-red-700'
              }`}>
                {puedeAprobar 
                  ? 'Todas las validaciones pasaron correctamente' 
                  : tieneAdvertencias
                  ? 'Hay aspectos que requieren tu atención'
                  : 'Existen problemas que impiden la aprobación'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validación de requisitos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Requisitos del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validacionRequisitos?.cumpleRequisitos ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                El usuario cumple con todos los requisitos del laboratorio
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Requisitos pendientes ({validacionRequisitos?.requisitosIncumplidos.length})
                </span>
              </div>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">El usuario debe completar:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {validacionRequisitos?.requisitosIncumplidos.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disponibilidad de recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Disponibilidad de Recursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {disponibilidadRecursos.map((recurso) => (
              <div 
                key={recurso.recurso_id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{recurso.nombre}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solicitado: {recurso.cantidad_solicitada} · 
                    Disponible: {recurso.cantidad_disponible}
                  </p>
                  {recurso.motivo && (
                    <p className="text-xs text-orange-600 mt-1">
                      {recurso.motivo}
                    </p>
                  )}
                </div>
                {recurso.disponible ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    No disponible
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conflictos de horario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Disponibilidad de Horario
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conflictosHorario?.tieneConflictos ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Conflictos detectados
                </span>
              </div>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {conflictosHorario.conflictos.map((conflicto, idx) => (
                      <li key={idx}>{conflicto}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                El horario está disponible y no hay conflictos
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      {!puedeAprobar && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Acciones recomendadas:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {!validacionRequisitos?.cumpleRequisitos && (
                <li>Solicitar al usuario que complete los requisitos pendientes</li>
              )}
              {disponibilidadRecursos.some(r => !r.disponible) && (
                <li>Coordinar con el usuario para cambiar recursos o fechas</li>
              )}
              {conflictosHorario?.tieneConflictos && (
                <li>Sugerir un horario alternativo al usuario</li>
              )}
              <li>Puedes marcar la solicitud como "En revisión" para solicitar más información</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}