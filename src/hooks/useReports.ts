// src/hooks/useReports.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export const useReports = (fechaInicio?: string, fechaFin?: string) => {
  const usage = useQuery({
    queryKey: ['report_usage', fechaInicio, fechaFin],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('report_usage', {
        p_fecha_inicio: fechaInicio || null,
        p_fecha_fin: fechaFin || null
      });
      if (error) throw error;
      return data;
    }
  });

  const inventory = useQuery({
    queryKey: ['report_inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('report_inventory');
      if (error) throw error;
      return data;
    }
  });

  const maintenance = useQuery({
    queryKey: ['report_maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('report_maintenance');
      if (error) throw error;
      return data;
    }
  });

  return { usage, inventory, maintenance };
};