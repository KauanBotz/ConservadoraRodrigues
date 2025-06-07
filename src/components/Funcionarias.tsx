
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Eye, Phone, MapPin, Clock, DollarSign, Loader2 } from "lucide-react";
import { useFuncionarias, type Funcionaria } from "@/hooks/useFuncionarias";

export function Funcionarias() {
  const { funcionarias, loading, createFuncionaria, updateFuncionaria } = useFuncionarias();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionaria, setEditingFuncionaria] = useState<Funcionaria | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    horas_semanais: '',
    salario_base: '',
    valor_passagem: '',
  });

  const handleEdit = (funcionaria: Funcionaria) => {
    setEditingFuncionaria(funcionaria);
    setFormData({
      nome: funcionaria.nome,
      cpf: funcionaria.cpf,
      telefone: funcionaria.telefone || '',
      endereco: funcionaria.endereco || '',
      horas_semanais: funcionaria.horas_semanais?.toString() || '',
      salario_base: funcionaria.salario_base?.toString() || '',
      valor_passagem: funcionaria.valor_passagem?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingFuncionaria(null);
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      endereco: '',
      horas_semanais: '',
      salario_base: '',
      valor_passagem: '',
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
      jornada_dias: null,
      horas_semanais: formData.horas_semanais ? parseInt(formData.horas_semanais) : null,
      dias_da_semana: null,
      salario_base: formData.salario_base ? parseFloat(formData.salario_base) : null,
      valor_passagem: formData.valor_passagem ? parseFloat(formData.valor_passagem) : null,
      documentos: [],
    };

    try {
      if (editingFuncionaria) {
        await updateFuncionaria(editingFuncionaria.id, funcionariaData);
      } else {
        await createFuncionaria(funcionariaData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

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
            <Users className="h-8 w-8 text-primary" />
            Funcionárias
          </h1>
          <p className="text-muted-foreground">Gerencie suas funcionárias e suas informações</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Funcionária
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFuncionaria ? 'Editar Funcionária' : 'Nova Funcionária'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input 
                    id="nome" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Digite o nome completo" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf" 
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    placeholder="000.000.000-00" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone" 
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(11) 99999-9999" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horas">Horas Semanais</Label>
                  <Input 
                    id="horas" 
                    type="number" 
                    value={formData.horas_semanais}
                    onChange={(e) => setFormData({...formData, horas_semanais: e.target.value})}
                    placeholder="40" 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input 
                    id="endereco" 
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    placeholder="Rua, número - Bairro" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario">Salário Base</Label>
                  <Input 
                    id="salario" 
                    type="number" 
                    step="0.01" 
                    value={formData.salario_base}
                    onChange={(e) => setFormData({...formData, salario_base: e.target.value})}
                    placeholder="1500.00" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passagem">Valor da Passagem</Label>
                  <Input 
                    id="passagem" 
                    type="number" 
                    step="0.01" 
                    value={formData.valor_passagem}
                    onChange={(e) => setFormData({...formData, valor_passagem: e.target.value})}
                    placeholder="4.50" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingFuncionaria ? 'Salvar Alterações' : 'Cadastrar Funcionária'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {funcionarias.map((funcionaria) => (
          <Card key={funcionaria.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-foreground">{funcionaria.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground">{funcionaria.cpf}</p>
                </div>
                <Badge variant="default" className="bg-secondary text-secondary-foreground">
                  Ativa
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {funcionaria.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="font-medium">{funcionaria.telefone}</span>
                  </div>
                )}
                
                {funcionaria.endereco && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Endereço:</span>
                    <span className="font-medium text-xs">{funcionaria.endereco}</span>
                  </div>
                )}
                
                {funcionaria.horas_semanais && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Jornada:</span>
                    <span className="font-medium">{funcionaria.horas_semanais}h/semana</span>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(funcionaria)}
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

      {funcionarias.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma funcionária cadastrada</h3>
            <p className="text-muted-foreground mb-4">Comece adicionando sua primeira funcionária ao sistema</p>
            <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Funcionária
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
