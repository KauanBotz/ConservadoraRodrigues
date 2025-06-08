import { useState, useEffect } from 'react';
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
  documentos: any;
  status: string;
}

export function useFuncionarias() {
  const [funcionarias, setFuncionarias] = useState<Funcionaria[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFuncionarias = async () => {
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
  };

  const createFuncionaria = async (funcionaria: Omit<Funcionaria, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('funcionarias')
        .insert([funcionaria])
        .select()
        .single();

      if (error) throw error;

      setFuncionarias(prev => [...prev, data]);
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

  const deleteFuncionaria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('funcionarias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFuncionarias(prev => prev.filter(f => f.id !== id));
      toast({
        title: 'Funcionária removida',
        description: 'Funcionária removida com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover funcionária',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const inativarFuncionaria = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('funcionarias')
        .update({ status: 'Inativa' })
        .eq('id', id)
        .select()
        .single();
  
      if (error) throw error;
  
      setFuncionarias(prev => prev.map(f => (f.id === id ? data : f)));
      toast({
        title: 'Funcionária inativada',
        description: 'Status alterado para Inativa.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao inativar funcionária',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchFuncionarias();
  }, []);

  return {
    funcionarias,
    loading,
    createFuncionaria,
    updateFuncionaria,
    deleteFuncionaria,
    inativarFuncionaria,
    refetch: fetchFuncionarias,
  };
}