import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRelatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRelatorios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("relatorios")
      .select("*")
      .order("data_criacao", { ascending: false });

    if (error) {
      console.error("Erro ao buscar relatórios:", error.message);
    } else {
      setRelatorios(data);
    }

    setLoading(false);
  };

  const addRelatorio = async (novo) => {
    const { error } = await supabase.from("relatorios").insert(novo);
    if (error) console.error("Erro ao adicionar relatório:", error.message);
    else fetchRelatorios();
  };

  const updateRelatorio = async (id, campos) => {
    const { error } = await supabase
      .from("relatorios")
      .update(campos)
      .eq("id", id);
    if (error) console.error("Erro ao atualizar relatório:", error.message);
    else fetchRelatorios();
  };

  const deleteRelatorio = async (id) => {
    const { error } = await supabase.from("relatorios").delete().eq("id", id);
    if (error) console.error("Erro ao excluir relatório:", error.message);
    else fetchRelatorios();
  };

  useEffect(() => {
    fetchRelatorios();
  }, []);

  return {
    relatorios,
    loading,
    fetchRelatorios,
    addRelatorio,
    updateRelatorio,
    deleteRelatorio,
  };
}
