import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Eye, Phone, MapPin, Clock, DollarSign, Loader2, User, BadgeInfo, Wallet, Bus, Ticket, ShieldCheck, ShieldX, Search } from "lucide-react";
import { useFuncionarias, type Funcionaria } from "@/hooks/useFuncionarias";

export function Funcionarias() {
  const { funcionarias, loading, createFuncionaria, updateFuncionaria } = useFuncionarias();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionaria, setEditingFuncionaria] = useState<Funcionaria | null>(null);
  const [detalhesFuncionaria, setDetalhesFuncionaria] = useState<Funcionaria | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    horas_semanais: '',
    salario_base: '',
    valor_passagem: '',
    passagens_mensais: '',
    status: 'Ativa',
  });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa

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
      nome: '',
      cpf: '',
      telefone: '',
      endereco: '',
      horas_semanais: '',
      salario_base: '',
      valor_passagem: '',
      passagens_mensais: '',
      status: 'Ativa',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const funcionariaData = {
      nome: formData.nome,
      cpf: formData.cpf,
      telefone: formData.telefone || null,
      endereco: formData.endereco || null,
      horas_semanais: formData.horas_semanais ? parseInt(formData.horas_semanais) : null,
      salario_base: formData.salario_base ? parseFloat(formData.salario_base) : null,
      valor_passagem: formData.valor_passagem ? parseFloat(formData.valor_passagem) : null,
      passagens_mensais: formData.passagens_mensais ? parseInt(formData.passagens_mensais) : null,
      status: formData.status,
      ...(editingFuncionaria ? {
        documentos: editingFuncionaria.documentos,
        dias_da_semana: editingFuncionaria.dias_da_semana,
        jornada_dias: editingFuncionaria.jornada_dias
      } : {
        documentos: null,
        dias_da_semana: null,
        jornada_dias: null
      })
    };

    try {
      if (editingFuncionaria) {
        await updateFuncionaria(editingFuncionaria.id, {
            nome: funcionariaData.nome,
            cpf: funcionariaData.cpf,
            telefone: funcionariaData.telefone,
            endereco: funcionariaData.endereco,
            horas_semanais: funcionariaData.horas_semanais,
            salario_base: funcionariaData.salario_base,
            valor_passagem: funcionariaData.valor_passagem,
            passagens_mensais: funcionariaData.passagens_mensais,
            status: funcionariaData.status
        });
      } else {
        await createFuncionaria(funcionariaData as Omit<Funcionaria, 'id'>);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar funcionária:", error);
    }
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setDetalhesFuncionaria(null);
    setEditingFuncionaria(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Filtra as funcionárias com base no termo de pesquisa
  const filteredFuncionarias = funcionarias.filter(f =>
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cpf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Funcionárias
          </h1>
          <p className="text-muted-foreground">Gerencie suas funcionárias e suas informações</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={open => open ? setIsDialogOpen(true) : closeDialog()}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Funcionária
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingFuncionaria
                  ? 'Editar Funcionária'
                  : detalhesFuncionaria
                  ? 'Detalhes da Funcionária'
                  : 'Nova Funcionária'}
              </DialogTitle>
            </DialogHeader>

            {detalhesFuncionaria ? (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nome Completo</p>
                      <p className="font-medium">{detalhesFuncionaria.nome}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-3">
                    <BadgeInfo className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">CPF</p>
                      <p className="font-medium">{detalhesFuncionaria.cpf}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-medium">{detalhesFuncionaria.telefone || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Endereço</p>
                      <p className="font-medium">{detalhesFuncionaria.endereco || 'Não informado'}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salário Base</p>
                      <p className="font-medium">R$ {detalhesFuncionaria.salario_base?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Passagens / Mês</p>
                      <p className="font-medium">{detalhesFuncionaria.passagens_mensais || 0}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-3">
                    <Bus className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Custo Mensal Passagem</p>
                      <p className="font-medium">
                         R$ {(
                          (detalhesFuncionaria.passagens_mensais || 0) * (detalhesFuncionaria.valor_passagem || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {detalhesFuncionaria.status === 'Ativa' ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                    ) : (
                        <ShieldX className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Situação</p>
                      <Badge variant="outline" className={detalhesFuncionaria.status === 'Ativa' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}>
                        {detalhesFuncionaria.status}
                      </Badge>
                    </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} required />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horas">Horas Semanais</Label>
                    <Input id="horas" type="number" value={formData.horas_semanais} onChange={(e) => setFormData({ ...formData, horas_semanais: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salario">Salário Base</Label>
                    <Input id="salario" type="number" step="0.01" value={formData.salario_base} onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passagem">Valor da Passagem (Diário)</Label>
                    <Input id="passagem" type="number" step="0.01" value={formData.valor_passagem} onChange={(e) => setFormData({ ...formData, valor_passagem: e.target.value })} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="passagens_mensais">Nº de Passagens por Mês</Label>
                    <Input id="passagens_mensais" type="number" value={formData.passagens_mensais} onChange={(e) => setFormData({ ...formData, passagens_mensais: e.target.value })} />
                  </div>
                  {editingFuncionaria && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select id="status" className="w-full border rounded px-2 py-1 h-10" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        <option value="Ativa">Ativa</option>
                        <option value="Inativa">Inativa</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingFuncionaria ? 'Salvar Alterações' : 'Cadastrar Funcionária'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* --- CAMPO DE PESQUISA ADICIONADO --- */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Pesquisar por nome ou CPF..."
          className="w-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFuncionarias.length > 0 ? (
          filteredFuncionarias.map(funcionaria => (
            <Card key={funcionaria.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${funcionaria.status === 'Ativa' ? 'border-l-yellow-400 bg-white' : 'border-l-red-300 bg-gray-100 text-muted-foreground'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{funcionaria.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{funcionaria.cpf}</p>
                    </div>
                    <Badge className={funcionaria.status === 'Ativa' ? 'bg-yellow-400 text-black' : 'bg-red-300 text-black'}>
                        {funcionaria.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {funcionaria.valor_passagem && (
                        <div className="flex items-center gap-2 text-sm">
                            <Bus className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Custo Passagem:</span>
                            <span className="font-medium">
                            R$ {(
                                (funcionaria.passagens_mensais || 0) * (funcionaria.valor_passagem || 0)
                            ).toFixed(2)} / mês
                            </span>
                        </div>
                    )}
                    {funcionaria.salario_base && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Salário:</span>
                        <span className="font-medium">R$ {funcionaria.salario_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(funcionaria)} className="flex-1"><Edit className="w-3 h-3 mr-1" />Editar</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDetails(funcionaria)}><Eye className="w-3 h-3 mr-1" />Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
            <p className="text-muted-foreground col-span-full text-center py-10">Nenhuma funcionária encontrada com o termo pesquisado.</p>
        )}
      </div>
    </div>
  );
}