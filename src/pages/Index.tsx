import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beaker, Users, Wrench, BarChart3, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Beaker,
      title: "Gestión de Laboratorios",
      description: "Administra perfiles, recursos y disponibilidad de todos los laboratorios del TEC",
    },
    {
      icon: Users,
      title: "Sistema de Reservas",
      description: "Solicita y gestiona reservas de espacios y equipos de manera centralizada",
    },
    {
      icon: Wrench,
      title: "Control de Mantenimiento",
      description: "Programa y da seguimiento a mantenimientos preventivos y correctivos",
    },
    {
      icon: BarChart3,
      title: "Reportes y Estadísticas",
      description: "Genera reportes detallados sobre el uso de recursos y equipos",
    },
  ];

  const benefits = [
    "Gestión centralizada de todos los laboratorios",
    "Reservas en línea con aprobación automatizada",
    "Control de inventario en tiempo real",
    "Calendario de mantenimientos integrado",
    "Notificaciones automáticas",
    "Reportes institucionales completos",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="container relative mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                TEC
              </div>
              <span className="text-sm font-medium">Sistema de Gestión de Laboratorios Académicos</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Bienvenido al{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SIGLA
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma integral para la gestión eficiente de laboratorios, equipos y recursos académicos 
              del Tecnológico de Costa Rica
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleGetStarted} className="text-lg h-12 px-8">
                {isAuthenticated ? "Ir al Dashboard" : "Ingresar al Sistema"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8">
                Conocer más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Módulos del Sistema</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa con todas las herramientas necesarias para gestionar tus laboratorios
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Beneficios del Sistema</h2>
              <p className="text-lg text-muted-foreground">
                Optimiza la gestión de tus recursos académicos
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-base">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg h-12 px-8">
                {isAuthenticated ? "Ir al Dashboard" : "Comenzar Ahora"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto border-2">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-3xl">¿Listo para comenzar?</CardTitle>
              <CardDescription className="text-lg">
                Accede al sistema con tus credenciales institucionales del TEC
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg h-12 px-8">
                {isAuthenticated ? "Ir al Dashboard" : "Iniciar Sesión"}
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8">
                Soporte Técnico
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
