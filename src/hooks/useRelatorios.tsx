import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Relatorio {
  id: string;
  mes_referencia: string;
  tipo_relatorio: string;
  dados_json: any;
  gerado_em: string;
}

export function useRelatorios() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRelatorios = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('relatorios')
        .select('*')
        .order('gerado_em', { ascending: false });

      if (error) throw error;
      setRelatorios(data || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar relatórios", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRelatorios();
  }, [fetchRelatorios]);

  const createRelatorio = async (reportData: Omit<Relatorio, 'id' | 'gerado_em'>) => {
    setLoading(true);
    try {
        const { data: newReport, error } = await supabase
        .from('relatorios')
        .insert([reportData])
        .select('*')
        .single();

        if (error) throw error;

        setRelatorios(prev => [newReport, ...prev]);
        toast({ title: "Relatório gerado!", description: "O novo relatório foi salvo com sucesso." });
        return newReport;
    } catch (error: any) {
        toast({ title: "Erro ao salvar relatório", description: error.message, variant: "destructive" });
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const deleteRelatorio = async (id: string) => {
    try {
        const { error } = await supabase.from('relatorios').delete().eq('id', id);
        if (error) throw error;
        setRelatorios(prev => prev.filter(r => r.id !== id));
        toast({ title: "Relatório removido." });
    } catch (error: any) {
        toast({ title: "Erro ao deletar relatório", description: error.message, variant: "destructive" });
        throw error;
    }
  };

  return { relatorios, loading, createRelatorio, deleteRelatorio };
}