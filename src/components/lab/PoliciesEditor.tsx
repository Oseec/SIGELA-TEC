// src/components/lab/PoliciesEditor.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLabAdmin } from "@/hooks/useLabAdmin";

export default function PoliciesEditor() {
  const { laboratorio } = useLabAdmin();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Políticas y Horarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Políticas Internas (JSON)</Label>
          <Textarea
            value={JSON.stringify(laboratorio?.politicas || {}, null, 2)}
            rows={10}
            readOnly
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label>Horario de Funcionamiento</Label>
          <Textarea
            value={JSON.stringify(laboratorio?.horario_funcionamiento || {}, null, 2)}
            rows={8}
            readOnly
            className="font-mono text-xs"
          />
        </div>
      </CardContent>
    </Card>
  );
}