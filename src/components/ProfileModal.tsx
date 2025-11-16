// src/components/ProfileModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, BookOpen, Award, Calendar, Edit2, Save, X } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Datos del perfil (simulados)
  const [profileData, setProfileData] = useState({
    nombreCompleto: "Juan Pérez González",
    carnet: "2021234567",
    carrera: "Ingeniería en Computación",
    correo: "juan.perez@estudiantec.cr",
    telefono: "+506 8888-9999",
  });

  // Certificaciones (simuladas)
  const certificaciones = [
    {
      id: 1,
      nombre: "Seguridad en Laboratorio Químico",
      estado: "Aprobado",
      fechaObtencion: "2024-02-15",
      vigencia: "2025-02-15",
      laboratorios: ["Lab. Química Orgánica", "Lab. Química Analítica"],
    },
    {
      id: 2,
      nombre: "Manejo de Equipos Eléctricos",
      estado: "Aprobado",
      fechaObtencion: "2024-01-20",
      vigencia: "2025-01-20",
      laboratorios: ["Lab. Electrónica", "Lab. Física"],
    },
    {
      id: 3,
      nombre: "Operación de Osciloscopio Avanzado",
      estado: "Pendiente",
      fechaObtencion: null,
      vigencia: null,
      laboratorios: ["Lab. Física Avanzada"],
    },
  ];

  const handleSave = () => {
    // Aquí iría la lógica de guardado
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Aquí se restaurarían los datos originales
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6" />
            Mi Perfil
          </DialogTitle>
          <DialogDescription>
            Información personal y certificaciones académicas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">
              <User className="mr-2 h-4 w-4" />
              Información Personal
            </TabsTrigger>
            <TabsTrigger value="certifications">
              <Award className="mr-2 h-4 w-4" />
              Certificaciones
            </TabsTrigger>
          </TabsList>

          {/* PESTAÑA: INFORMACIÓN PERSONAL */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Datos Personales</CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nombre"
                      value={profileData.nombreCompleto}
                      onChange={(e) =>
                        setProfileData({ ...profileData, nombreCompleto: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carnet">Número de Carné / Código</Label>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="carnet"
                      value={profileData.carnet}
                      onChange={(e) =>
                        setProfileData({ ...profileData, carnet: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrera">Carrera / Departamento</Label>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="carrera"
                      value={profileData.carrera}
                      onChange={(e) =>
                        setProfileData({ ...profileData, carrera: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="correo"
                      type="email"
                      value={profileData.correo}
                      onChange={(e) =>
                        setProfileData({ ...profileData, correo: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telefono"
                      type="tel"
                      value={profileData.telefono}
                      onChange={(e) =>
                        setProfileData({ ...profileData, telefono: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PESTAÑA: CERTIFICACIONES */}
          <TabsContent value="certifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Certificaciones</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Capacitaciones requeridas para acceso a laboratorios especializados
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {certificaciones.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          {cert.nombre}
                        </h4>
                      </div>
                      <Badge
                        variant={
                          cert.estado === "Aprobado"
                            ? "default"
                            : cert.estado === "Pendiente"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {cert.estado}
                      </Badge>
                    </div>

                    {cert.fechaObtencion && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Obtenida: {new Date(cert.fechaObtencion).toLocaleDateString("es-CR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Vigencia hasta: {new Date(cert.vigencia!).toLocaleDateString("es-CR")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Laboratorios habilitados:</p>
                      <div className="flex flex-wrap gap-2">
                        {cert.laboratorios.map((lab, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {lab}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {cert.estado === "Pendiente" && (
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        Solicitar Capacitación
                      </Button>
                    )}
                  </div>
                ))}

                {certificaciones.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tienes certificaciones registradas</p>
                    <Button variant="outline" className="mt-4">
                      Explorar Capacitaciones Disponibles
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}