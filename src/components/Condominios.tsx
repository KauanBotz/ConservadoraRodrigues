import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Edit, Eye, MapPin, DollarSign, FileText, Loader2, Search, UserCircle, Mail, Phone, CalendarDays, ShieldCheck, ShieldX } from "lucide-react";
import { useCondominios, type Condominio } from "@/hooks/useCondominios";
import { useToast } from "@/hooks/use-toast";

// Função para formatar o número de telefone para exibição
const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return 'Telefone não informado';
    const cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.length === 11) {
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
    }
    if (cleaned.length === 10) {
        const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
    }
    return phone;
};

export function Condominios() {
  const { condominios, loading, createCondominio, updateCondominio } = useCondominios();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null);
  const [detalhesCondominio, setDetalhesCondominio] = useState<Condominio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    valor_servico: '',
    recebe_nota_fiscal: false,
    status: 'Ativo' as 'Ativo' | 'Inativo',
    sindico: '',
    email_sindico: '',
    telefone_sindico: '',
    vencimento_boleto: '',
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
      sindico: condominio.sindico || '',
      email_sindico: condominio.email_sindico || '',
      telefone_sindico: condominio.telefone_sindico || '',
      vencimento_boleto: condominio.vencimento_boleto?.toString() || '',
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
      sindico: '',
      email_sindico: '',
      telefone_sindico: '',
      vencimento_boleto: '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vencimento_boleto) {
        toast({
            title: "Campo Obrigatório",
            description: "Por favor, selecione o dia do vencimento do boleto.",
            variant: "destructive",
        });
        return;
    }

    const condominioData = {
      nome: formData.nome,
      endereco: formData.endereco,
      valor_servico: formData.valor_servico ? parseFloat(formData.valor_servico) : null,
      recebe_nota_fiscal: formData.recebe_nota_fiscal,
      status: formData.status,
      sindico: formData.sindico || null,
      email_sindico: formData.email_sindico || null,
      telefone_sindico: formData.telefone_sindico || null,
      vencimento_boleto: formData.vencimento_boleto ? parseInt(formData.vencimento_boleto) : null,
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
  
  const filteredCondominios = condominios.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Nome</p><p className="font-medium">{detalhesCondominio.nome}</p></div></div>
                        <div className="flex items-center gap-3"><UserCircle className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Síndico(a)</p><p className="font-medium">{detalhesCondominio.sindico || 'Não informado'}</p></div></div>
                        <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Email Síndico(a)</p><p className="font-medium">{detalhesCondominio.email_sindico || 'Não informado'}</p></div></div>
                        <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Telefone Síndico(a)</p><p className="font-medium">{formatPhoneNumber(detalhesCondominio.telefone_sindico)}</p></div></div>
                        <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Endereço</p><p className="font-medium">{detalhesCondominio.endereco}</p></div></div>
                        <div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Valor do Serviço</p><p className="font-medium">R$ {detalhesCondominio.valor_servico?.toFixed(2) || '0.00'}</p></div></div>
                        <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Vencimento do Boleto</p><p className="font-medium">Todo dia {detalhesCondominio.vencimento_boleto || 'N/A'}</p></div></div>
                        <div className="flex items-center gap-3">
                            {detalhesCondominio.status === 'Ativo' ? <ShieldCheck className="h-5 w-5 text-green-600"/> : <ShieldX className="h-5 w-5 text-red-600" />}
                            <div><p className="text-xs text-muted-foreground">Situação</p><Badge variant="outline" className={detalhesCondominio.status === 'Ativo' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}>{detalhesCondominio.status}</Badge></div>
                        </div>
                    </div>
                     <div className="pt-4 flex justify-end">
                        <Button variant="outline" onClick={closeDialog}>Fechar</Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2"><Label htmlFor="nome">Nome do Condomínio</Label><Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required /></div>
                  <div className="space-y-2 col-span-2"><Label htmlFor="endereco">Endereço Completo</Label><Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="sindico">Nome do Síndico(a)</Label><Input id="sindico" value={formData.sindico} onChange={(e) => setFormData({ ...formData, sindico: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="telefone_sindico">Telefone do Síndico(a)</Label><Input id="telefone_sindico" value={formData.telefone_sindico} onChange={(e) => setFormData({ ...formData, telefone_sindico: e.target.value })} /></div>
                  <div className="space-y-2 col-span-2"><Label htmlFor="email_sindico">Email do Síndico(a)</Label><Input id="email_sindico" type="email" value={formData.email_sindico} onChange={(e) => setFormData({ ...formData, email_sindico: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="valor">Valor Mensal (R$)</Label><Input id="valor" type="number" step="0.01" value={formData.valor_servico} onChange={(e) => setFormData({ ...formData, valor_servico: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="vencimento_boleto">Dia do Vencimento</Label><Select required value={formData.vencimento_boleto} onValueChange={(value) => setFormData({ ...formData, vencimento_boleto: value })}><SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger><SelectContent>{Array.from({ length: 31 }, (_, i) => i + 1).map(day => (<SelectItem key={day} value={day.toString()}>{day}</SelectItem>))}</SelectContent></Select></div>
                  <div className="flex items-center space-x-2 pt-6"><Switch id="status" checked={formData.status === 'Ativo'} onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'Ativo' : 'Inativo' })} /><Label htmlFor="status">{formData.status}</Label></div>
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
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input type="text" placeholder="Pesquisar por nome ou endereço..." className="w-full pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-l-4 border-l-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Receita Mensal Total (Ativos)</p><p className="text-3xl font-bold text-secondary">R$ {totalValorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
            <div className="text-right"><p className="text-sm text-muted-foreground">Condomínios Ativos</p><p className="text-2xl font-bold text-primary">{totalCondominiosAtivos}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCondominios.length > 0 ? (
          filteredCondominios.map((condominio) => (
            <Card key={condominio.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${condominio.status === 'Ativo' ? 'border-l-yellow-400 bg-white' : 'border-l-red-300 bg-gray-100 text-muted-foreground'}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg text-foreground">{condominio.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{condominio.sindico || 'Síndico não informado'}</p>
                    </div>
                    <Badge className={`text-xs px-2 py-1 rounded ${condominio.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{condominio.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span>{condominio.email_sindico || 'Email não informado'}</span></div>
                        <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span>{formatPhoneNumber(condominio.telefone_sindico)}</span></div>
                        <div className="flex items-center gap-2 text-sm"><CalendarDays className="w-4 h-4 text-muted-foreground" /><span>Vencimento todo dia {condominio.vencimento_boleto}</span></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(condominio)} className="flex-1"><Edit className="w-3 h-3 mr-1" />Editar</Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDetails(condominio)}><Eye className="w-3 h-3 mr-1" />Detalhes</Button>
                    </div>
                </CardContent>
            </Card>
        ))
        ) : (
            <div className="col-span-full text-center py-10"><p className="text-muted-foreground">Nenhum condomínio encontrado.</p></div>
        )}
      </div>
    </div>
  );
}