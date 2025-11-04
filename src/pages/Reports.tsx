import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, Package, TrendingUp } from "lucide-react";

export default function Reports() {
  const reports = [
    {
      title: "Reporte de Uso Global",
      description: "Estadísticas generales de utilización",
      icon: BarChart3,
      color: "text-blue-500",
    },
    {
      title: "Inventario Consolidado",
      description: "Estado actual de todos los recursos",
      icon: Package,
      color: "text-green-500",
    },
    {
      title: "Consumo de Materiales",
      description: "Análisis de consumo por periodo",
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      title: "Desempeño por Laboratorio",
      description: "Métricas de eficiencia operativa",
      icon: BarChart3,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Reportes Institucionales
        </h1>
        <p className="text-muted-foreground">
          Genera y exporta reportes detallados del sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-accent ${report.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">{report.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Generar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exportar Datos</CardTitle>
          <CardDescription>Selecciona el formato de exportación deseado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
