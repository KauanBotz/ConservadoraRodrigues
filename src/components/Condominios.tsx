
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Building2, Plus, Edit, Eye, MapPin, DollarSign, FileText, Loader2 } from "lucide-react";
import { useCondominios, type Condominio } from "@/hooks/useCondominios";

export function Condominios() {
  const { condominios, loading, createCondominio, updateCondominio } = useCondominios();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    valor_servico: '',
    recebe_nota_fiscal: false,
  });

  const handleEdit = (condominio: Condominio) => {
    setEditingCondominio(condominio);
    setFormData({
      nome: condominio.nome,
      endereco: condominio.endereco,
      valor_servico: condominio.valor_servico?.toString() || '',
      recebe_nota_fiscal: condominio.recebe_nota_fiscal || false,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCondominio(null);
    setFormData({
      nome: '',
      endereco: '',
      valor_servico: '',
      recebe_nota_fiscal: false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const condominioData = {
      nome: formData.nome,
      endereco: formData.endereco,
      valor_servico: formData.valor_servico ? parseFloat(formData.valor_servico) : null,
      recebe_nota_fiscal: formData.recebe_nota_fiscal,
      contrato_digital: null,
    };

    try {
      if (editingCondominio) {
        await updateCondominio(editingCondominio.id, condominioData);
      } else {
        await createCondominio(condominioData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const totalValorMensal = condominios
    .filter(c => c.valor_servico)
    .reduce((sum, c) => sum + (c.valor_servico || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Condomínios
          </h1>
          <p className="text-muted-foreground">Gerencie os condomínios atendidos pela conservadora</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCondominio ? 'Editar Condomínio' : 'Novo Condomínio'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Condomínio</Label>
                  <Input 
                    id="nome" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Digite o nome do condomínio" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input 
                    id="endereco" 
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    placeholder="Rua, número - Bairro - CEP" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Mensal (R$)</Label>
                  <Input 
                    id="valor" 
                    type="number" 
                    step="0.01" 
                    value={formData.valor_servico}
                    onChange={(e) => setFormData({...formData, valor_servico: e.target.value})}
                    placeholder="2500.00" 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="nota-fiscal" 
                    checked={formData.recebe_nota_fiscal}
                    onCheckedChange={(checked) => setFormData({...formData, recebe_nota_fiscal: checked})}
                  />
                  <Label htmlFor="nota-fiscal">Recebe Nota Fiscal</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingCondominio ? 'Salvar Alterações' : 'Cadastrar Condomínio'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Financeiro */}
      <Card className="border-l-4 border-l-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Mensal Total</p>
              <p className="text-3xl font-bold text-secondary">
                R$ {totalValorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Condomínios Ativos</p>
              <p className="text-2xl font-bold text-primary">
                {condominios.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {condominios.map((condominio) => (
          <Card key={condominio.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-foreground">{condominio.nome}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="bg-secondary text-secondary-foreground">
                      Ativo
                    </Badge>
                    {condominio.recebe_nota_fiscal && (
                      <Badge variant="outline" className="text-xs">
                        Nota Fiscal
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block">Endereço:</span>
                    <span className="font-medium text-xs leading-relaxed">{condominio.endereco}</span>
                  </div>
                </div>
                
                {condominio.valor_servico && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Valor Mensal:</span>
                    <span className="font-bold text-secondary">
                      R$ {condominio.valor_servico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {condominio.contrato_digital && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Contrato:</span>
                    <Button variant="link" className="h-auto p-0 text-xs text-primary">
                      Ver documento
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(condominio)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-3 h-3 mr-1" />
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {condominios.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum condomínio cadastrado</h3>
            <p className="text-muted-foreground mb-4">Comece adicionando o primeiro condomínio ao sistema</p>
            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Condomínio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
