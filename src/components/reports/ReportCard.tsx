import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface Props {
  title: string;
  description: string;
  onView: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export default function ReportCard({ title, description, onView, onExportPDF, onExportExcel }: Props) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={onView}>Ver Reporte</Button>
          <Button size="sm" variant="outline" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button size="sm" variant="outline" onClick={onExportExcel}>
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}