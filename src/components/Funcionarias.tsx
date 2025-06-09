import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, Edit, Eye, Phone, MapPin, Loader2, User, BadgeInfo, Wallet, Bus, Ticket, ShieldCheck, ShieldX, Search, Vote, Baby, Trash2, CalendarPlus, CalendarX, Fingerprint } from "lucide-react";
import { useFuncionarias, type Funcionaria } from "@/hooks/useFuncionarias";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Funções de formatação para exibição
const formatCPF = (cpf: string | null) => {
  if (!cpf) return 'Não informado';
  const cleaned = ('' + cpf).replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
};

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

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
}


export function Funcionarias() {
  const { toast } = useToast();
  const { funcionarias, loading, createFuncionaria, updateFuncionaria } = useFuncionarias();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionaria, setEditingFuncionaria] = useState<Funcionaria | null>(null);
  const [detalhesFuncionaria, setDetalhesFuncionaria] = useState<Funcionaria | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nome: '', cpf: '', telefone: '', endereco: '', horas_semanais: '', salario_base: '', valor_passagem: '', passagens_mensais: '', status: 'Ativa',
    rg: '', pis: '', titulo_eleitor: '', data_de_admissao: '', data_de_desligamento: ''
  });
  const [cpfsFilhos, setCpfsFilhos] = useState<string[]>([]);

  useEffect(() => {
    if (isDialogOpen && editingFuncionaria) {
      setCpfsFilhos(editingFuncionaria.cpfs_filhos || []);
    } else if (isDialogOpen && !editingFuncionaria) {
      setCpfsFilhos([]);
    }
  }, [isDialogOpen, editingFuncionaria]);
  
  const handleCpfsChange = (index: number, value: string) => {
    const newCpfs = [...cpfsFilhos];
    newCpfs[index] = value;
    setCpfsFilhos(newCpfs);
  };
  
  const addCpfField = () => setCpfsFilhos([...cpfsFilhos, '']);

  const removeCpfField = (index: number) => {
    const newCpfs = cpfsFilhos.filter((_, i) => i !== index);
    setCpfsFilhos(newCpfs);
  };


  const handleEdit = (funcionaria: Funcionaria) => {
    setDetalhesFuncionaria(null);
    setEditingFuncionaria(funcionaria);
    setFormData({
      nome: funcionaria.nome,
      cpf: funcionaria.cpf,
      telefone: funcionaria.telefone || '',
      endereco: funcionaria.endereco || '',
      horas_semanais: funcionaria.horas_semanais?.toString() || '',
      salario_base: funcionaria.salario_base?.toString() || '',
      valor_passagem: funcionaria.valor_passagem?.toString() || '',
      passagens_mensais: funcionaria.passagens_mensais?.toString() || '',
      status: funcionaria.status || 'Ativa',
      rg: funcionaria.rg || '',
      pis: funcionaria.pis || '',
      titulo_eleitor: funcionaria.titulo_eleitor || '',
      data_de_admissao: funcionaria.data_de_admissao || '',
      data_de_desligamento: funcionaria.data_de_desligamento || '',
    });
    setIsDialogOpen(true);
  };

  const handleDetails = (funcionaria: Funcionaria) => {
    setEditingFuncionaria(null);
    setDetalhesFuncionaria(funcionaria);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingFuncionaria(null);
    setDetalhesFuncionaria(null);
    setFormData({
      nome: '', cpf: '', telefone: '', endereco: '', horas_semanais: '', salario_base: '', valor_passagem: '', passagens_mensais: '', status: 'Ativa',
      rg: '', pis: '', titulo_eleitor: '', data_de_admissao: '', data_de_desligamento: ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rg) {
        toast({
            title: "Campo Obrigatório",
            description: "Por favor, preencha o campo RG.",
            variant: "destructive",
        });
        return;
    }
    
    const funcionariaData = {
      ...formData,
      horas_semanais: formData.horas_semanais ? parseInt(formData.horas_semanais) : null,
      salario_base: formData.salario_base ? parseFloat(formData.salario_base) : null,
      valor_passagem: formData.valor_passagem ? parseFloat(formData.valor_passagem) : null,
      passagens_mensais: formData.passagens_mensais ? parseInt(formData.passagens_mensais) : null,
      cpfs_filhos: cpfsFilhos.map(cpf => cpf.trim()).filter(cpf => cpf),
      data_de_admissao: formData.data_de_admissao || null,
      data_de_desligamento: formData.status === 'Ativa' ? null : formData.data_de_desligamento || null
    };

    try {
      if (editingFuncionaria) {
        await updateFuncionaria(editingFuncionaria.id, funcionariaData);
      } else {
        await createFuncionaria(funcionariaData as Omit<Funcionaria, 'id'>);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Toast de erro já é mostrado no hook
    }
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setDetalhesFuncionaria(null);
    setEditingFuncionaria(null);
  }

  const filteredFuncionarias = funcionarias.filter(f =>
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cpf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Users className="h-8 w-8 text-primary" />Funcionárias</h1>
          <p className="text-muted-foreground">Gerencie suas funcionárias e suas informações</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={open => open ? setIsDialogOpen(true) : closeDialog()}>
          <DialogTrigger asChild><Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" />Nova Funcionária</Button></DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>{editingFuncionaria? 'Editar Funcionária' : detalhesFuncionaria? 'Detalhes da Funcionária' : 'Nova Funcionária'}</DialogTitle></DialogHeader>
            {detalhesFuncionaria ? (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                  <div className="flex items-center gap-3"><User className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Nome Completo</p><p className="font-medium">{detalhesFuncionaria.nome}</p></div></div>
                  <div className="flex items-center gap-3"><BadgeInfo className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">CPF</p><p className="font-medium">{formatCPF(detalhesFuncionaria.cpf)}</p></div></div>
                  <div className="flex items-center gap-3"><Fingerprint className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">RG</p><p className="font-medium">{detalhesFuncionaria.rg || 'Não informado'}</p></div></div>
                  
                  <div className="flex items-center gap-3 col-span-full"><MapPin className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Endereço</p><p className="font-medium">{detalhesFuncionaria.endereco || 'Não informado'}</p></div></div>
                  
                  <Separator className="col-span-full" />
                  
                  <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium">{formatPhoneNumber(detalhesFuncionaria.telefone)}</p></div></div>
                  <div className="flex items-center gap-3"><Ticket className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">PIS</p><p className="font-medium">{detalhesFuncionaria.pis || 'Não informado'}</p></div></div>
                  <div className="flex items-center gap-3"><Vote className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Título de Eleitor</p><p className="font-medium">{detalhesFuncionaria.titulo_eleitor || 'Não informado'}</p></div></div>
                  
                  <div className="flex items-center gap-3"><CalendarPlus className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Data de Admissão</p><p className="font-medium">{formatDate(detalhesFuncionaria.data_de_admissao)}</p></div></div>
                  
                  {detalhesFuncionaria.status === 'Inativa' && detalhesFuncionaria.data_de_desligamento && 
                    <div className="flex items-center gap-3"><CalendarX className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Data de Desligamento</p><p className="font-medium">{formatDate(detalhesFuncionaria.data_de_desligamento)}</p></div></div>
                  }
                  <div className="flex items-center gap-3"><Wallet className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Salário Base</p><p className="font-medium">R$ {detalhesFuncionaria.salario_base?.toFixed(2) || '0.00'}</p></div></div>
                  
                  <Separator className="col-span-full" />
                  <div className="flex items-start gap-3 col-span-full"><Baby className="h-5 w-5 text-muted-foreground mt-1" /><div><p className="text-xs text-muted-foreground">Filhos (menores de 14 anos)</p>{(detalhesFuncionaria.cpfs_filhos && detalhesFuncionaria.cpfs_filhos.length > 0 && detalhesFuncionaria.cpfs_filhos[0] !== '') ? (<ul className="list-disc pl-5 font-medium">{detalhesFuncionaria.cpfs_filhos.map((cpf, i) => <li key={i}>{formatCPF(cpf)}</li>)}</ul>) : (<p className="font-medium">Nenhum filho informado</p>)}</div></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={closeDialog}>Fechar</Button></DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2"><Label htmlFor="nome">Nome Completo</Label><Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="cpf">CPF</Label><Input id="cpf" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} required /></div>
                  <div className="space-y-2 col-span-full"><Label htmlFor="endereco">Endereço</Label><Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="telefone">Telefone</Label><Input id="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="rg">RG <span className="text-red-500">*</span></Label><Input id="rg" value={formData.rg} onChange={(e) => setFormData({ ...formData, rg: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="data_de_admissao">Data de Admissão</Label><Input id="data_de_admissao" type="date" value={formData.data_de_admissao} onChange={(e) => setFormData({ ...formData, data_de_admissao: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="pis">PIS</Label><Input id="pis" value={formData.pis} onChange={(e) => setFormData({ ...formData, pis: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="titulo_eleitor">Título de Eleitor</Label><Input id="titulo_eleitor" value={formData.titulo_eleitor} onChange={(e) => setFormData({ ...formData, titulo_eleitor: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="salario">Salário Base</Label><Input id="salario" type="number" step="0.01" value={formData.salario_base} onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })} /></div>
                </div>
                <Separator className="my-6"/>
                <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="text-base font-medium">Filhos (menores de 14 anos)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCpfField}
                  className="w-fit"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Filho
                </Button>
              </div>

              {cpfsFilhos.map((cpf, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`CPF do ${index + 1}º filho(a)`}
                    value={cpf}
                    onChange={(e) => handleCpfsChange(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCpfField(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

                {editingFuncionaria && (
                    <>
                    <Separator className="my-6"/>
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Controle Administrativo</Label>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="status"
                                checked={formData.status === 'Ativa'}
                                onCheckedChange={(checked) => {
                                    setFormData({ ...formData, status: checked ? 'Ativa' : 'Inativa' });
                                }}
                            />
                             <Label htmlFor="status">Funcionária {formData.status}</Label>
                        </div>
                        {formData.status === 'Inativa' && (
                            <div className="space-y-2 mt-4"><Label htmlFor="data_de_desligamento">Data de Desligamento</Label><Input id="data_de_desligamento" type="date" value={formData.data_de_desligamento} onChange={(e) => setFormData({ ...formData, data_de_desligamento: e.target.value })} /></div>
                        )}
                    </div>
                    </>
                )}
                <DialogFooter><div className="flex-1" /><Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button><Button type="submit">{editingFuncionaria ? 'Salvar Alterações' : 'Cadastrar Funcionária'}</Button></DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="text" placeholder="Pesquisar por nome ou CPF..." className="w-full pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      {loading ? ( <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div> ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFuncionarias.length > 0 ? (
          filteredFuncionarias.map(funcionaria => (
            <Card key={funcionaria.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${funcionaria.status === 'Ativa' ? 'border-l-yellow-400 bg-white' : 'border-l-red-300 bg-gray-100 text-muted-foreground'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{funcionaria.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{formatCPF(funcionaria.cpf)}</p>
                    </div>
                    <Badge className={funcionaria.status === 'Ativa' ? 'bg-yellow-400 text-black' : 'bg-red-300 text-black'}>{funcionaria.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span>{formatPhoneNumber(funcionaria.telefone)}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Bus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Custo Passagem:</span>
                        <span className="font-medium">R$ {((funcionaria.passagens_mensais || 0) * (funcionaria.valor_passagem || 0)).toFixed(2)} / mês</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(funcionaria)} className="flex-1"><Edit className="w-3 h-3 mr-1" />Editar</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDetails(funcionaria)}><Eye className="w-3 h-3 mr-1" />Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
            <p className="text-muted-foreground col-span-full text-center py-10">Nenhuma funcionária encontrada.</p>
        )}
      </div>
      )}
    </div>
  );
}