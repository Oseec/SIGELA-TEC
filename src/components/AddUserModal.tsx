import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function AddUserModal({ open, onClose, onCreated }) {
  const { session } = useAuth();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [carnet, setCarnet] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");

  const emailRules = {
    admin: [
        /@tec\.ac\.cr$/,
    ],
    docente: [
        /@itcr\.ac\.cr$/,
    ],
    tecnico: [
        /@itcr\.ac\.cr$/,
    ],
    estudiante: [
        /@estudiante\.tec\.ac\.cr$/,
        /@estudiantec\.cr$/,
    ]
  };

  const validateEmailByRole = (email, rol) => {
    const rules = emailRules[rol] || [];

    return rules.some((regex) => regex.test(email));
  };

  const createUser = async () => {
    console.clear();
    console.log("=== INICIANDO CREACIÓN DE USUARIO ===");

    console.log("Valores recibidos:", {
        nombre,
        correo,
        carnet,
        telefono,
        rol,
        password
    });

    if (!nombre || !correo || !carnet || !password) {
        alert("Todos los campos obligatorios deben estar llenos");
        return;
    }

    if (!validateEmailByRole(correo, rol)) {
        alert("El correo no pertenece al dominio permitido para el rol seleccionado.");
        return;
    }

    console.log("Llamando función crear_usuario...");

    const resp = await fetch(
      "https://gyuiztmgtlsiczxssdjn.supabase.co/functions/v1/crear_usuario",
      {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: correo,
          password,
          rol,
          nombre,
          carnet,
          telefono,
        }),
      }
    );

    const data = await resp.json();

    console.log("Respuesta Edge Function:", data);

    if (!resp.ok) {
      alert("Error creando usuario: " + data.error);
      return;
    }

    alert("Usuario creado correctamente.");

    onCreated();
    onClose();

    setNombre("");
    setCorreo("");
    setTelefono("");
    setCarnet("");
    setPassword("");
    setRol("estudiante");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <Input
            placeholder="Correo institucional"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <Input
            placeholder="Carnet / Código"
            value={carnet}
            onChange={(e) => setCarnet(e.target.value)}
          />

          <Input
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <Input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="w-full border rounded p-2"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="admin">Administrador</option>
            <option value="docente">Docente</option>
            <option value="tecnico">Técnico</option>
            <option value="estudiante">Estudiante</option>
          </select>
        </div>

        <DialogFooter>
          <Button onClick={createUser}>Crear Usuario</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
