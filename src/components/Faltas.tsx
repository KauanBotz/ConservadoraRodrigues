import { useState } from 'react';
import { useFaltas } from '@/hooks/useFaltas';
import { useFuncionarias } from '@/hooks/useFuncionarias';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export function Faltas() {
  const { faltas, loading, createFalta, updateFalta, deleteFalta } = useFaltas();
  const { funcionarias } = useFuncionarias();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFalta, setEditingFalta] = useState<any>(null);
  const [filtroFuncionario, setFiltroFuncionario] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [formData, setFormData] = useState< 
  
  {
    
    data: string;
    motivo: string;
    justificativa: boolean;
    desconto_aplicado: boolean;
    id_funcionaria: string;
  }>({
    data: '',
    motivo: '',
    justificativa: false,
    desconto_aplicado: false,
    id_funcionaria: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.id_funcionaria) {
        alert("Selecione uma funcionária antes de salvar.");
        return;
      }

      const faltaData = {
        data: formData.data,
        motivo: formData.motivo || null,
        justificativa: formData.justificativa,
        desconto_aplicado: formData.desconto_aplicado,
        id_funcionaria: formData.id_funcionaria || null
      };

      if (!formData.id_funcionaria) {
        alert("Selecione uma funcionária antes de salvar.");
        return;
      }
      
      if (!formData.justificativa && !formData.desconto_aplicado) {
        alert("Selecione se a falta é justificada ou se terá desconto.");
        return;
      }
      

      if (editingFalta) {
        await updateFalta(editingFalta.id, faltaData);
      } else {
        await createFalta(faltaData);
      }

      setIsDialogOpen(false);
      setEditingFalta(null);
      setFormData({
        data: '',
        motivo: '',
        justificativa: false,
        desconto_aplicado: false,
        id_funcionaria: ''
      });
    } catch (error) {
      console.error('Erro ao salvar falta:', error);
    }
  };

  const handleEdit = (falta: any) => {
    setEditingFalta(falta);
    setFormData({
      data: falta.data,
      motivo: falta.motivo || '',
      justificativa: falta.justificativa || false,
      desconto_aplicado: falta.desconto_aplicado || false,
      id_funcionaria: falta.id_funcionaria || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de falta?')) {
      await deleteFalta(id);
    }
  };

  const resetForm = () => {
    setFormData({
      data: '',
      motivo: '',
      justificativa: false,
      desconto_aplicado: false,
      id_funcionaria: ''
    });
    setEditingFalta(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const faltasFiltradas = faltas.filter(f => {
    const mesmaFunc = !filtroFuncionario || filtroFuncionario === 'todas' || f.id_funcionaria === filtroFuncionario;
    const mesmoMes = !filtroMes || filtroMes === 'todos' || new Date(f.data).getMonth() + 1 === parseInt(filtroMes, 10);
    return mesmaFunc && mesmoMes;
  });
  

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Registro de Faltas</h1>
        <p className="text-muted-foreground">Gerencie as faltas das funcionárias</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">Total de faltas: {faltas.length}</span>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Falta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingFalta ? 'Editar Falta' : 'Registrar Falta'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              required
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            />
          </div>

              <div className="space-y-2">
                <Label htmlFor="funcionaria">Funcionária</Label>
                <Select
                  value={formData.id_funcionaria}
                  onValueChange={(value) => setFormData({ ...formData, id_funcionaria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma funcionária" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionarias.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nome} {f.status !== 'Ativa' ? '(Inativa)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo da Falta</Label>
                <Textarea
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Descreva o motivo da falta..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="justificativa"
                    checked={formData.justificativa}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, justificativa: !!checked })
                    }
                  />
                  <Label htmlFor="justificativa">Falta justificada</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="desconto_aplicado"
                    checked={formData.desconto_aplicado}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, desconto_aplicado: !!checked })
                    }
                  />
                  <Label htmlFor="desconto_aplicado">Desconto aplicado</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingFalta ? 'Atualizar' : 'Registrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <Label>Filtrar por Funcionária</Label>
        <Select
          value={filtroFuncionario}
          onValueChange={setFiltroFuncionario}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
            {funcionarias.map(f => (
              <SelectItem key={f.id} value={f.id}>
                {f.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label>Filtrar por Mês</Label>
        <Select
          value={filtroMes}
          onValueChange={setFiltroMes}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {[...Array(12)].map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {`${i + 1}`.padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>


      <Card>
        <CardHeader>
          <CardTitle>Lista de Faltas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Funcionária</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Justificada</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {faltasFiltradas.map((falta) => (
                <TableRow key={falta.id}>
                  <TableCell>{new Date(falta.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{falta.funcionaria?.nome || 'N/A'}</TableCell>
                  <TableCell>{falta.motivo || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      falta.justificativa
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {falta.justificativa ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell>
                  {(() => {
                    const salario = falta.funcionaria?.salario_base || 0;
                    const aplicavel = falta.desconto_aplicado && !falta.justificativa;
                    const valorDia = salario / 30;
                    const desconto = aplicavel ? valorDia * 2 : 0;
                    return `R$ ${desconto.toFixed(2)}`;
                  })()}
                </TableCell>





                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(falta)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(falta.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
