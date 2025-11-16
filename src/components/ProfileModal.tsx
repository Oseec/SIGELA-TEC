"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Award,
  Calendar,
  Edit2,
  Save,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient"; 
import { useAuth } from "@/contexts/AuthContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProfileData = {
  nombreCompleto: string;
  carnet: string;
  carreraNombre: string;
  carreraId: number | null;
  correo: string;
  telefono: string;
  rol: string | null;
};

type Certificacion = {
  id: number;
  nombre: string;
  estado: string;
  fechaObtencion: string | null;
  fechaVencimiento: string | null;
  laboratorios: string[];
};

export default function ProfileModal({
  isOpen,
  onClose,
}: ProfileModalProps) {
  const { user } = useAuth(); // aquí debes tener user.id, user.email, user.role, user.name
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar datos reales cuando se abre el modal
  useEffect(() => {
    if (!isOpen || !user) return;

    const cargarDatos = async () => {
      setLoading(true);

      // 1. Perfil
      const { data: perfil, error: errorPerfil } = await supabase
        .from("vw_perfil_usuario")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!errorPerfil && perfil) {
        setProfileData({
          nombreCompleto: perfil.nombre_completo ?? user.name ?? "",
          carnet: perfil.carnet_o_codigo ?? "",
          carreraNombre: perfil.carrera_nombre ?? "",
          carreraId: perfil.carrera_id ?? null,
          correo: perfil.correo ?? user.email ?? "",
          telefono: perfil.telefono ?? "",
          rol: perfil.rol ?? user.role ?? null,
        });
      }

      // 2. Certificaciones
      const { data: certs, error: errorCerts } = await supabase
        .from("vw_certificaciones_usuario")
        .select("*")
        .eq("usuario_id", user.id);

      if (!errorCerts && certs) {
        const mapped: Certificacion[] = certs.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          estado: c.estado ?? "Vigente",
          fechaObtencion: c.fecha_obtenida,
          fechaVencimiento: c.fecha_vencimiento,
          laboratorios: Array.isArray(c.obligatorio_para)
            ? c.obligatorio_para
            : [],
        }));
        setCertificaciones(mapped);
      }

      setLoading(false);
    };

    cargarDatos();
  }, [isOpen, user]);

  const handleFieldChange = (
    field: keyof ProfileData,
    value: string
  ) => {
    if (!profileData) return;
    setProfileData({
      ...profileData,
      [field]:
        field === "carreraId" ? Number(value) || null : value,
    } as ProfileData);
  };

  const handleSave = async () => {
    if (!profileData || !user) return;
    setLoading(true);

    // 1. Actualizar perfil en tabla perfil_usuario
    const { error: errorPerfil } = await supabase.rpc(
      "actualizar_mi_perfil",
      {
        p_nombre_completo: profileData.nombreCompleto,
        p_carnet_o_codigo: profileData.carnet,
        p_carrera_id: profileData.carreraId,
        p_telefono: profileData.telefono,
      }
    );

    // 2. Actualizar correo en Auth si cambió
    let errorCorreo = null;
    if (profileData.correo && profileData.correo !== user.email) {
      const { error } = await supabase.auth.updateUser({
        email: profileData.correo,
      });
      errorCorreo = error;
    }

    setLoading(false);

    if (!errorPerfil && !errorCorreo) {
      setIsEditing(false);
    } else {
      // aquí podrías mostrar un toast de error
      console.error("Error al actualizar perfil:", {
        errorPerfil,
        errorCorreo,
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // opcional: recargar datos originales desde la DB
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6" />
            Mi Perfil
          </DialogTitle>
          <DialogDescription>
            Información del usuario, certificaciones y datos de
            contacto.
          </DialogDescription>
        </DialogHeader>

        {loading || !profileData ? (
          <div className="py-10 text-center text-muted-foreground">
            Cargando información del perfil…
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Rol
                </span>
                <span className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {profileData.rol === "student" && "Estudiante"}
                  {profileData.rol === "teacher" && "Docente"}
                  {profileData.rol === "technician" && "Técnico"}
                  {profileData.rol === "lab_admin" &&
                    "Admin. Laboratorio"}
                  {profileData.rol === "system_admin" &&
                    "Admin. Sistema"}
                  {!profileData.rol && "Usuario"}
                </span>
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>

            <Tabs defaultValue="perfil">
              <TabsList className="mb-4">
                <TabsTrigger value="perfil">
                  <User className="w-4 h-4 mr-2" />
                  Datos personales
                </TabsTrigger>
                <TabsTrigger value="certificaciones">
                  <Award className="w-4 h-4 mr-2" />
                  Certificaciones
                </TabsTrigger>
              </TabsList>

              {/* Tab de perfil */}
              <TabsContent value="perfil">
                <Card>
                  <CardHeader>
                    <CardTitle>Información del usuario</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre completo</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <Input
                            value={profileData.nombreCompleto}
                            onChange={(e) =>
                              handleFieldChange(
                                "nombreCompleto",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Carnet o código</Label>
                        <Input
                          className="mt-1"
                          value={profileData.carnet}
                          onChange={(e) =>
                            handleFieldChange(
                              "carnet",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div>
                        <Label>Correo institucional</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            value={profileData.correo}
                            onChange={(e) =>
                              handleFieldChange(
                                "correo",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Teléfono</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <Input
                            value={profileData.telefono}
                            onChange={(e) =>
                              handleFieldChange(
                                "telefono",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Carrera</Label>
                        <Input
                          className="mt-1"
                          value={profileData.carreraNombre}
                          onChange={(e) =>
                            handleFieldChange(
                              "carreraNombre",
                              e.target.value
                            )
                          }
                          disabled
                        />
                        {/* Si después quieres editar carrera, 
                            aquí podrías poner un select con las carreras,
                            y usar profileData.carreraId */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab de certificaciones */}
              <TabsContent value="certificaciones">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {certificaciones.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No hay certificaciones registradas.
                      </p>
                    )}

                    <div className="space-y-3">
                      {certificaciones.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4" />
                              <span className="font-medium">{cert.nombre}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                              {cert.fechaObtencion && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Obtenida: {String(cert.fechaObtencion)}
                                </span>
                              )}
                              {cert.fechaVencimiento && (
                                <span>
                                  Vigencia: {String(cert.fechaVencimiento)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 md:mt-0">
                            <Badge
                              variant={
                                cert.estado === "Vigente" ? "default" : "outline"
                              }
                            >
                              {String(cert.estado)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
