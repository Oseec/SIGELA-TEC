import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Laboratories from "./pages/Laboratories";
import Reservations from "./pages/Reservations";
import ReservationDetail from "./pages/ReservationDetail";
import Maintenance from "@/pages/Maintenance";
import StudentDashboard from "./pages/StudentDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Audit from "./pages/Audit";
import Reports from "./pages/Reports";
import LabAdminDashboard from "./pages/LabAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Admin routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/laboratories" element={<Laboratories />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/reservations/:id" element={<ReservationDetail />} />
              <Route path="/maintenance" element={<Maintenance />} />

              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/reports" element={<Reports />} />
              
              {/* Student/Teacher routes */}
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              
              {/* Technician routes */}
              <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
              
              {/* Lab Admin routes */}
              <Route path="/lab-admin" element={<LabAdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
