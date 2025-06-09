import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Plus, Edit, Eye, MapPin, DollarSign, FileCheck, Loader2, Search, UserCircle, Mail, Phone, CalendarDays, Bus, Truck, Trash2, ShieldCheck, ShieldX } from "lucide-react";
import { useCondominios, type Condominio, type OnibusDetalhe } from "@/hooks/useCondominios";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// --- FUNÇÕES DE FORMATAÇÃO PARA EXIBIÇÃO ---
const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return 'Não informado';
    const cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.length === 11) {
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) { return `(${match[1]}) ${match[2]}-${match[3]}`; }
    }
    if (cleaned.length === 10) {
        const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
        if (match) { return `(${match[1]}) ${match[2]}-${match[3]}`; }
    }
    return phone;
};

const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return 'Não informado';
    const cleaned = ('' + cnpj).replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
    }
    return cnpj;
}

// --- COMPONENTE PARA EXIBIR TRANSPORTE ---
const TransporteInfo = ({condominio}: {condominio: Condominio | null}) => {
    if(!condominio) return null;
    const { transporte_tipo, transporte_onibus_detalhes } = condominio;

    if (transporte_tipo === 'veiculo_empresa') {
        return <div className="flex items-center gap-2 text-sm"><Truck className="w-4 h-4 text-muted-foreground" /><span>Veículo da Empresa</span></div>;
    }

    if (transporte_tipo === 'onibus' && transporte_onibus_detalhes && transporte_onibus_detalhes.length > 0) {
        return (
            <div className="flex items-start gap-2 text-sm">
                <Bus className="w-4 h-4 text-muted-foreground mt-1" />
                <div className="flex flex-wrap gap-1">
                    {transporte_onibus_detalhes.map((onibus, i) => (
                        <Badge key={i} variant="outline" className={`font-normal ${onibus.tipo === 'move' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                            {onibus.linha}
                        </Badge>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function Condominios() {
  const { condominios, loading, createCondominio, updateCondominio } = useCondominios();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null);
  const [detalhesCondominio, setDetalhesCondominio] = useState<Condominio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '', endereco: '', valor_servico: '', status: 'Ativo' as 'Ativo' | 'Inativo', sindico: '',
    email_sindico: '', telefone_sindico: '', vencimento_boleto: '', cnpj: '', transporte_tipo: 'nenhum',
  });
  const [linhasDeOnibus, setLinhasDeOnibus] = useState<OnibusDetalhe[]>([]);

  useEffect(() => {
    if(isDialogOpen && editingCondominio) {
      setLinhasDeOnibus(editingCondominio.transporte_onibus_detalhes || []);
    } else {
      setLinhasDeOnibus([]);
    }
  }, [isDialogOpen, editingCondominio])

  const handleLinhaChange = (index: number, field: 'linha' | 'tipo', value: string) => {
    const novasLinhas = [...linhasDeOnibus];
    novasLinhas[index] = {...novasLinhas[index], [field]: value as 'bairro' | 'move'};
    setLinhasDeOnibus(novasLinhas);
  }

  const addLinhaField = () => setLinhasDeOnibus([...linhasDeOnibus, { linha: '', tipo: 'bairro' }]);
  const removeLinhaField = (index: number) => setLinhasDeOnibus(linhasDeOnibus.filter((_, i) => i !== index));

  const openDialog = (condominio: Condominio | null = null, mode: 'edit' | 'details' = 'edit') => {
    if (mode === 'details' && condominio) {
      setDetalhesCondominio(condominio);
      setEditingCondominio(null);
    } else {
      setEditingCondominio(condominio);
      setDetalhesCondominio(null);
      if (condominio) {
        setFormData({
          nome: condominio.nome,
          endereco: condominio.endereco,
          valor_servico: condominio.valor_servico?.toString() || '',
          status: condominio.status,
          sindico: condominio.sindico || '',
          email_sindico: condominio.email_sindico || '',
          telefone_sindico: condominio.telefone_sindico || '',
          vencimento_boleto: condominio.vencimento_boleto?.toString() || '',
          cnpj: condominio.cnpj || '',
          transporte_tipo: condominio.transporte_tipo || 'nenhum',
        });
      } else {
        setFormData({
          nome: '', endereco: '', valor_servico: '', status: 'Ativo', sindico: '',
          email_sindico: '', telefone_sindico: '', vencimento_boleto: '', cnpj: '', transporte_tipo: 'nenhum',
        });
      }
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vencimento_boleto) {
        toast({ title: "Campo Obrigatório", description: "Por favor, selecione o dia do vencimento.", variant: "destructive" });
        return;
    }
    const condominioData = {
      ...formData,
      valor_servico: formData.valor_servico ? parseFloat(formData.valor_servico) : null,
      vencimento_boleto: parseInt(formData.vencimento_boleto),
      transporte_onibus_detalhes: formData.transporte_tipo === 'onibus' ? linhasDeOnibus.filter(l => l.linha) : null,
    };
    try {
      if (editingCondominio) {
        await updateCondominio(editingCondominio.id, condominioData);
      } else {
        await createCondominio(condominioData as Omit<Condominio, 'id'>);
      }
      setIsDialogOpen(false);
    } catch (error) { /* handled in hook */ }
  };

  const closeDialog = () => setIsDialogOpen(false);

  const totalValorMensal = condominios.filter(c => c.status === 'Ativo' && c.valor_servico).reduce((sum, c) => sum + (c.valor_servico || 0), 0);
  const totalCondominiosAtivos = condominios.filter(c => c.status === 'Ativo').length;
  const filteredCondominios = condominios.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || (c.cnpj && c.cnpj.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Building2 className="h-8 w-8 text-primary" />Condomínios</h1><p className="text-muted-foreground">Gerencie os condomínios atendidos</p></div>
        <Button onClick={() => openDialog(null)}><Plus className="w-4 h-4 mr-2" />Novo Condomínio</Button>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="text" placeholder="Pesquisar por nome ou CNPJ..." className="w-full pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

      <Card className="border-l-4 border-l-secondary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Receita Mensal (Ativos)</p><p className="text-3xl font-bold text-secondary">R$ {totalValorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
            <div className="text-right"><p className="text-sm text-muted-foreground">Condomínios Ativos</p><p className="text-2xl font-bold text-primary">{totalCondominiosAtivos}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCondominios.map((condominio) => (
            <Card key={condominio.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${condominio.status === 'Ativo' ? 'border-l-yellow-400 bg-white' : 'border-l-red-300 bg-gray-100 text-muted-foreground'}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg text-foreground">{condominio.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{formatCNPJ(condominio.cnpj)}</p>
                    </div>
                    <Badge className={`text-xs px-2 py-1 rounded ${condominio.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{condominio.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm"><UserCircle className="w-4 h-4 text-muted-foreground" /><span>{condominio.sindico || 'Síndico não informado'}</span></div>
                        <TransporteInfo condominio={condominio} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => openDialog(condominio, 'edit')} className="flex-1"><Edit className="w-3 h-3 mr-1" />Editar</Button>
                        <Button variant="outline" size="sm" onClick={() => openDialog(condominio, 'details')} className="flex-1"><Eye className="w-3 h-3 mr-1" />Detalhes</Button>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl flex flex-col h-auto md:h-[90vh]">
                <DialogHeader><DialogTitle>{editingCondominio ? 'Editar Condomínio' : detalhesCondominio ? 'Detalhes do Condomínio' : 'Novo Condomínio'}</DialogTitle></DialogHeader>
                {detalhesCondominio ? (
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                            <div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Nome</p><p className="font-medium">{detalhesCondominio.nome}</p></div></div>
                            <div className="flex items-center gap-3"><FileCheck className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">CNPJ</p><p className="font-medium">{formatCNPJ(detalhesCondominio.cnpj)}</p></div></div>
                            <div className="flex items-center gap-3"><UserCircle className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Síndico(a)</p><p className="font-medium">{detalhesCondominio.sindico || 'Não informado'}</p></div></div>
                            <div className="flex items-center gap-3 col-span-full"><MapPin className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Endereço</p><p className="font-medium">{detalhesCondominio.endereco}</p></div></div>
                            <Separator className="col-span-full"/>
                            <div className="flex items-center gap-3 col-span-2"><Mail className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Email Síndico</p><p className="font-medium">{detalhesCondominio.email_sindico || 'Não informado'}</p></div></div>
                            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Telefone Síndico</p><p className="font-medium">{formatPhoneNumber(detalhesCondominio.telefone_sindico)}</p></div></div>
                            <Separator className="col-span-full"/>
                            <div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Valor do Serviço</p><p className="font-medium">R$ {detalhesCondominio.valor_servico?.toFixed(2) || '0.00'}</p></div></div>
                            <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Vencimento</p><p className="font-medium">Todo dia {detalhesCondominio.vencimento_boleto || 'N/A'}</p></div></div>
                             <div className="flex items-center gap-3">
                                {detalhesCondominio.status === 'Ativo' ? <ShieldCheck className="h-5 w-5 text-green-600"/> : <ShieldX className="h-5 w-5 text-red-600" />}
                                <div><p className="text-xs text-muted-foreground">Situação</p><Badge variant="outline" className={detalhesCondominio.status === 'Ativo' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}>{detalhesCondominio.status}</Badge></div>
                            </div>
                            <TransporteInfo condominio={detalhesCondominio}/>
                        </div>
                        <DialogFooter className="pt-4"><Button variant="outline" onClick={closeDialog}>Fechar</Button></DialogFooter>
                    </div>
                ) : (
                    <>
                    <ScrollArea className="flex-grow pr-6 -mr-6">
                        <form id="condo-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2"><Label htmlFor="nome">Nome do Condomínio</Label><Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required /></div>
                                <div className="space-y-2"><Label htmlFor="cnpj">CNPJ</Label><Input id="cnpj" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} /></div>
                                <div className="space-y-2"><Label htmlFor="sindico">Nome do Síndico(a)</Label><Input id="sindico" value={formData.sindico} onChange={(e) => setFormData({ ...formData, sindico: e.target.value })} /></div>
                                <div className="space-y-2 col-span-2"><Label htmlFor="endereco">Endereço Completo</Label><Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} required /></div>
                                <div className="space-y-2"><Label htmlFor="telefone_sindico">Telefone do Síndico(a)</Label><Input id="telefone_sindico" value={formData.telefone_sindico} onChange={(e) => setFormData({ ...formData, telefone_sindico: e.target.value })} /></div>
                                <div className="space-y-2"><Label htmlFor="email_sindico">Email do Síndico(a)</Label><Input id="email_sindico" type="email" value={formData.email_sindico} onChange={(e) => setFormData({ ...formData, email_sindico: e.target.value })} /></div>
                                <div className="space-y-2"><Label htmlFor="valor">Valor Mensal (R$)</Label><Input id="valor" type="number" step="0.01" value={formData.valor_servico} onChange={(e) => setFormData({ ...formData, valor_servico: e.target.value })} /></div>
                                <div className="space-y-2"><Label htmlFor="vencimento_boleto">Dia do Vencimento <span className="text-red-500">*</span></Label><Select value={formData.vencimento_boleto} onValueChange={(value) => setFormData({ ...formData, vencimento_boleto: value })}><SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger><SelectContent>{Array.from({ length: 31 }, (_, i) => i + 1).map(day => (<SelectItem key={day} value={day.toString()}>{day}</SelectItem>))}</SelectContent></Select></div>
                            </div>
                            <Separator/>
                            <div className="space-y-4">
                                <Label className="text-base font-medium">Transporte</Label>
                                <RadioGroup value={formData.transporte_tipo} onValueChange={(value) => setFormData({...formData, transporte_tipo: value})} className="flex space-x-4 pt-2">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="nenhum" id="nenhum"/><Label htmlFor="nenhum">Nenhum</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="onibus" id="onibus"/><Label htmlFor="onibus">Ônibus</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="veiculo_empresa" id="veiculo"/><Label htmlFor="veiculo">Veículo da Empresa</Label></div>
                                </RadioGroup>
                                {formData.transporte_tipo === 'onibus' && (
                                    <div className="space-y-4 pl-2 pt-2 border-l-2 ml-2">
                                        {linhasDeOnibus.map((onibus, index) => (
                                            <div key={index} className="space-y-3 p-3 bg-muted/50 rounded-lg">
                                                <div className="flex justify-between items-center"><Label htmlFor={`linha-${index}`} className="font-semibold">Linha de Ônibus {index + 1}</Label><Button type="button" variant="ghost" size="icon" onClick={() => removeLinhaField(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
                                                <Input id={`linha-${index}`} value={onibus.linha} onChange={(e) => handleLinhaChange(index, 'linha', e.target.value)} placeholder="Ex: 619, 617, 50" />
                                                <RadioGroup value={onibus.tipo} onValueChange={(value) => handleLinhaChange(index, 'tipo', value)} className="flex space-x-4 pt-2">
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="bairro" id={`bairro-${index}`}/><Label htmlFor={`bairro-${index}`}>Bairro</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="move" id={`move-${index}`}/><Label htmlFor={`move-${index}`}>MOVE</Label></div>
                                                </RadioGroup>
                                            </div>
                                        ))}
                                       <div className="mt-2"><Button type="button" variant="outline" size="sm" onClick={addLinhaField}><Plus className="h-4 w-4 mr-2"/>Adicionar Linha</Button></div>
                                    </div>
                                )}
                            </div>
                            {editingCondominio && (
                                <><Separator /><div className="space-y-2"><Label className="text-base font-medium">Controle Administrativo</Label><div className="flex items-center space-x-2 pt-2"><Switch id="status" checked={formData.status === 'Ativo'} onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'Ativo' : 'Inativo' })} /><Label htmlFor="status">Condomínio {formData.status}</Label></div></div></>
                            )}
                        </form>
                    </ScrollArea>
                    <DialogFooter className="pt-4"><Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button><Button type="submit" form="condo-form">{editingCondominio ? 'Salvar Alterações' : 'Cadastrar'}</Button></DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
