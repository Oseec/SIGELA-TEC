import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  FlaskConical,
  Calendar,
  Package,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Users,
  Building2,
  History,
  Bell,
  ClipboardList,
  Shield,
} from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

const getMenuItemsByRole = (role: UserRole): MenuGroup[] => {
  // Estudiantes y Docentes - redirigen a StudentDashboard
  if (role === "student" || role === "teacher") {
    return [
      {
        group: "Principal",
        items: [
          { title: "Inicio", url: "/student-dashboard", icon: Home },
        ],
      },
    ];
  }

  // Técnicos - redirigen a TechnicianDashboard
  if (role === "technician") {
    return [
      {
        group: "Principal",
        items: [
          { title: "Panel de Control", url: "/technician-dashboard", icon: Home },
        ],
      },
    ];
  }

  // Administradores de Laboratorio
  if (role === "lab_admin") {
    return [
      {
        group: "Principal",
        items: [
          { title: "Inicio", url: "/lab-admin", icon: Home },
        ],
      },
      {
        group: "Laboratorio",
        items: [
          { title: "Reservas", url: "/reservations", icon: Calendar },
        ],
      },
    ];
  }

  // Administrador del Sistema - acceso completo
  if (role === "system_admin") {
    return [
      {
        group: "Principal",
        items: [
          { title: "Dashboard", url: "/dashboard", icon: Home },
        ],
      },
      {
        group: "Administración",
        items: [
          { title: "Usuarios", url: "/users", icon: Users },
          { title: "Configuración", url: "/settings", icon: Settings },
          { title: "Auditoría", url: "/audit", icon: Shield },
          { title: "Reportes", url: "/reports", icon: FileText },
        ],
      },
    ];
  }

  return [
    {
      group: "Principal",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: Home },
      ],
    },
  ];
};

export const Sidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === "collapsed";
  
  const menuItems = user ? getMenuItemsByRole(user.role) : [];

  return (
    <SidebarUI className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="px-6 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-xl">
              TEC
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">SIGELA</h2>
                <p className="text-xs text-sidebar-foreground/70">Sistema de Laboratorios</p>
              </div>
            )}
          </div>
        </div>

        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            {!isCollapsed && <SidebarGroupLabel>{group.group}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </SidebarUI>
  );
};
