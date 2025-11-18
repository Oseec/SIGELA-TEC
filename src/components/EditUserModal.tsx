import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function EditUserModal({ open, onClose, user, onUpdated }) {
  const { session } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre_completo ?? "");
  const [correo, setCorreo] = useState(user?.email ?? "");
  const [rol, setRol] = useState(user?.rol ?? "estudiante");
  const [carnet, setCarnet] = useState(user?.carnet_o_codigo ?? "");
  const [telefono, setTelefono] = useState(user?.telefono ?? "");

  // Cada vez que cambie `user`, actualizar los campos
  useEffect(() => {
    if (user) {
      setNombre(user.nombre_completo ?? "");
      setCorreo(user.email ?? "");
      setRol(user.rol ?? "estudiante");
      setCarnet(user.carnet_o_codigo ?? "");
      setTelefono(user.telefono ?? "");
    }
  }, [user]);

  const emailRules = {
    admin: [/@tec\.ac\.cr$/],
    docente: [/@itcr\.ac\.cr$/],
    tecnico: [/@itcr\.ac\.cr$/],
    estudiante: [/@estudiante\.tec\.ac\.cr$/, /@estudiantec\.cr$/],
  };

  const validateEmailByRole = (email, rol) => {
    const rules = emailRules[rol] || [];
    return rules.some((regex) => regex.test(email));
  };

  const updateUser = async () => {
    if (!nombre || !correo || !carnet) {
        alert("Nombre, correo y carnet son obligatorios");
        return;
    }

    if (!validateEmailByRole(correo, rol)) {
        alert("El correo no pertenece al dominio permitido para el rol seleccionado.");
        return;
    }

    const resp = await fetch("https://gyuiztmgtlsiczxssdjn.supabase.co/functions/v1/actualizar_usuario", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: user.id, nombre, email: correo, rol, carnet, telefono }),
    });

    const data = await resp.json();

    if (!resp.ok) {
        alert("Error actualizando usuario: " + data.error);
        return;
    }

    onUpdated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input placeholder="Correo institucional" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          <Input placeholder="Carnet / Código" value={carnet} onChange={(e) => setCarnet(e.target.value)} />
          <Input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />

          <select className="w-full border rounded p-2" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="admin">Administrador</option>
            <option value="docente">Docente</option>
            <option value="tecnico">Técnico</option>
            <option value="estudiante">Estudiante</option>
          </select>
        </div>

        <DialogFooter>
          <Button onClick={updateUser}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
