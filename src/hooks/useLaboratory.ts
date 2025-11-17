// src/hooks/useLaboratory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export const useLaboratory = (labId: number = 1) => {
  const queryClient = useQueryClient();

  const { data: lab, isLoading } = useQuery({
    queryKey: ['laboratorio', labId],
    queryFn: async () => {
      const { data } = await supabase
        .from('laboratorio')
        .select('*')
        .eq('id', labId)
        .single();
      return data;
    }
  });

  // src/hooks/useLaboratory.ts → SOLO SI LO CREASTE
// Reemplaza el mutationFn por:
interface LabUpdate {
  nombre?: string;
  codigo?: string;
  ubicacion?: string;
  descripcion?: string | null;
  capacidad_maxima?: number;
}

const updateLab = useMutation({
  mutationFn: async (updates: LabUpdate) => {
    const { error } = await supabase
      .from('laboratorio')
      .update(updates)
      .eq('id', labId);
    if (error) throw error;
  },
 
});

  return { lab, isLoading, updateLab };
};