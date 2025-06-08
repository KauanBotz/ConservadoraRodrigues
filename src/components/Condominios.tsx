import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Building2, Plus, Edit, Eye, MapPin, DollarSign, FileText, FileCheck, Loader2 } from "lucide-react";
import { useCondominios, type Condominio } from "@/hooks/useCondominios";

export function Condominios() {
  const { condominios, loading, createCondominio, updateCondominio } = useCondominios();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null);
  const [detalhesCondominio, setDetalhesCondominio] = useState<Condominio | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    valor_servico: '',
    recebe_nota_fiscal: false,
    status: 'Ativo' as 'Ativo' | 'Inativo',
  });

  const handleEdit = (condominio: Condominio) => {
    setDetalhesCondominio(null);
    setEditingCondominio(condominio);
    setFormData({
      nome: condominio.nome,
      endereco: condominio.endereco,
      valor_servico: condominio.valor_servico?.toString() || '',
      recebe_nota_fiscal: condominio.recebe_nota_fiscal || false,
      status: condominio.status,
    });
    setIsDialogOpen(true);
  };
  
  const handleDetails = (condominio: Condominio) => {
    setEditingCondominio(null);
    setDetalhesCondominio(condominio);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCondominio(null);
    setDetalhesCondominio(null);
    setFormData({
      nome: '',
      endereco: '',
      valor_servico: '',
      recebe_nota_fiscal: false,
      status: 'Ativo',
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
      contrato_digital: editingCondominio?.contrato_digital || null,
      status: formData.status,
    };

    try {
      if (editingCondominio) {
        await updateCondominio(editingCondominio.id, condominioData);
      } else {
        await createCondominio(condominioData as Omit<Condominio, 'id'>);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCondominio(null);
    setDetalhesCondominio(null);
  }

  const totalValorMensal = condominios
    .filter(c => c.status === 'Ativo' && c.valor_servico)
    .reduce((sum, c) => sum + (c.valor_servico || 0), 0);

  const totalCondominiosAtivos = condominios.filter(c => c.status === 'Ativo').length;

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
          <p className="text-muted-foreground">Gerencie os condomínios atendidos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => open ? setIsDialogOpen(true) : closeDialog()}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCondominio ? 'Editar Condomínio' : detalhesCondominio ? 'Detalhes do Condomínio' : 'Novo Condomínio'}
              </DialogTitle>
            </DialogHeader>
            {detalhesCondominio ? (
                 <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Nome do Condomínio</p>
                                <p className="font-medium">{detalhesCondominio.nome}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Endereço</p>
                                <p className="font-medium">{detalhesCondominio.endereco}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Valor do Serviço</p>
                                <p className="font-medium">R$ {detalhesCondominio.valor_servico?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <FileCheck className="h-5 w-5 text-muted-foreground" />
                           <div>
                             <p className="text-xs text-muted-foreground">Emite Nota Fiscal?</p>
                             <p className="font-medium">{detalhesCondominio.recebe_nota_fiscal ? 'Sim' : 'Não'}</p>
                           </div>
                        </div>
                        {detalhesCondominio.contrato_digital && (
                             <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Contrato Digital</p>
                                    <a href={detalhesCondominio.contrato_digital} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                                        Visualizar Contrato
                                    </a>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Badge className={detalhesCondominio.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {detalhesCondominio.status}
                            </Badge>
                        </div>
                    </div>
                     <div className="pt-4 flex justify-end">
                        <Button variant="outline" onClick={closeDialog}>
                            Fechar
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Condomínio</Label>
                    <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Digite o nome do condomínio" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço Completo</Label>
                    <Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} placeholder="Rua, número - Bairro - CEP" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor Mensal (R$)</Label>
                    <Input id="valor" type="number" step="0.01" value={formData.valor_servico} onChange={(e) => setFormData({ ...formData, valor_servico: e.target.value })} placeholder="2500.00" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="status" checked={formData.status === 'Ativo'} onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'Ativo' : 'Inativo' })} />
                    <Label htmlFor="status">{formData.status === 'Ativo' ? 'Ativo' : 'Inativo'}</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">{editingCondominio ? 'Salvar Alterações' : 'Cadastrar Condomínio'}</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-l-4 border-l-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Mensal Total (Ativos)</p>
              <p className="text-3xl font-bold text-secondary">
                R$ {totalValorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Condomínios Ativos</p>
              <p className="text-2xl font-bold text-primary">
                {totalCondominiosAtivos}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {condominios
        .map((condominio) => (
          <Card key={condominio.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${condominio.status === 'Ativo' ? 'border-l-yellow-400 bg-white' : 'border-l-red-300 bg-gray-100 text-muted-foreground'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">{condominio.nome}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-xs px-2 py-1 rounded ${condominio.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                {condominio.status}
            </Badge>
              {condominio.recebe_nota_fiscal && (
                <Badge variant="outline" className="text-xs">Nota Fiscal</Badge>
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
              <span className="font-bold text-secondary">R$ {condominio.valor_servico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {condominio.contrato_digital && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contrato:</span>
              <Button asChild variant="link" className="h-auto p-0 text-xs text-primary"><a href={condominio.contrato_digital} target="_blank" rel="noopener noreferrer">Ver documento</a></Button>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(condominio)} className="flex-1"><Edit className="w-3 h-3 mr-1" />Editar</Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDetails(condominio)}><Eye className="w-3 h-3 mr-1" />Detalhes</Button>
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
        <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" />Adicionar Primeiro Condomínio</Button>
        </CardContent>
    </Card>
    )}
    </div>
  );
}