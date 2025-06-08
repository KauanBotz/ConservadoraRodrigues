import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Funcionaria {
  id: string;
  nome: string;
  cpf: string;
  telefone: string | null;
  endereco: string | null;
  jornada_dias: number | null;
  horas_semanais: number | null;
  dias_da_semana: string[] | null;
  salario_base: number | null;
  valor_passagem: number | null;
  passagens_mensais: number | null;
  documentos: any;
  status: string;
  rg: string | null;
  pis: string | null;
  titulo_eleitor: string | null;
  cpfs_filhos: string[] | null;
  data_de_admissao: string | null;
  data_de_desligamento: string | null;
}

export function useFuncionarias() {
  const [funcionarias, setFuncionarias] = useState<Funcionaria[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFuncionarias = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('funcionarias')
        .select('*') 
        .order('nome');
  
      if (error) throw error;
      setFuncionarias(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar funcionárias',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFuncionarias();
  }, [fetchFuncionarias]);

  const createFuncionaria = async (funcionaria: Omit<Funcionaria, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('funcionarias')
        .insert([funcionaria])
        .select()
        .single();

      if (error) throw error;

      await fetchFuncionarias(); // Força a atualização completa da lista
      toast({
        title: 'Funcionária cadastrada',
        description: 'Funcionária adicionada com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar funcionária',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateFuncionaria = async (id: string, funcionaria: Partial<Funcionaria>) => {
    try {
      const { data, error } = await supabase
        .from('funcionarias')
        .update(funcionaria)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFuncionarias(prev => prev.map(f => (f.id === id ? data : f)));
      toast({
        title: 'Funcionária atualizada',
        description: 'Dados atualizados com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar funcionária',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    funcionarias,
    loading,
    createFuncionaria,
    updateFuncionaria,
    refetch: fetchFuncionarias,
  };
}