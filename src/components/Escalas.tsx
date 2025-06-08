import { useState } from 'react';
import { useEscalas } from '@/hooks/useEscalas';
import { useFuncionarias } from '@/hooks/useFuncionarias';
import { useCondominios } from '@/hooks/useCondominios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, Calendar, Loader2 } from 'lucide-react';

export function Escalas() {
  const { escalas, loading, createEscala, updateEscala, deleteEscala } = useEscalas();
  const { funcionarias } = useFuncionarias();
  const { condominios } = useCondominios();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscala, setEditingEscala] = useState<any>(null);
  const [formData, setFormData] = useState({
    dia_semana: '',
    horas_trabalho: '',
    id_funcionaria: '',
    id_condominio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.id_funcionaria || !formData.id_condominio) {
      alert("Selecione uma funcionária e um condomínio antes de salvar.");
      return;
    }
  
    try {
      const escalaData = {
        dia_semana: formData.dia_semana,
        horas_trabalho: Number(formData.horas_trabalho),
        id_funcionaria: formData.id_funcionaria,
        id_condominio: formData.id_condominio
      };
  
      if (editingEscala) {
        await updateEscala(editingEscala.id, escalaData);
      } else {
        await createEscala(escalaData);
      }
  
      setIsDialogOpen(false);
      setEditingEscala(null);
      setFormData({ dia_semana: '', horas_trabalho: '', id_funcionaria: '', id_condominio: '' });
    } catch (error) {
      console.error('Erro ao salvar escala:', error);
    }
  };
  

  const handleEdit = (escala: any) => {
    setEditingEscala(escala);
    setFormData({
      dia_semana: escala.dia_semana,
      horas_trabalho: escala.horas_trabalho.toString(),
      id_funcionaria: escala.id_funcionaria || '',
      id_condominio: escala.id_condominio || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta escala?')) {
      await deleteEscala(id);
    }
  };

  const resetForm = () => {
    setFormData({ dia_semana: '', horas_trabalho: '', id_funcionaria: '', id_condominio: '' });
    setEditingEscala(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Escalas de Trabalho</h1>
        <p className="text-muted-foreground">Gerencie as escalas das funcionárias</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">Total de escalas: {escalas.length}</span>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Escala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEscala ? 'Editar Escala' : 'Nova Escala'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dia_semana">Dia da Semana</Label>
                <Select
                  value={formData.dia_semana}
                  onValueChange={(value) => setFormData({ ...formData, dia_semana: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((dia) => (
                      <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horas_trabalho">Horas de Trabalho</Label>
                <Input
                  id="horas_trabalho"
                  type="number"
                  step="0.5"
                  value={formData.horas_trabalho}
                  onChange={(e) => setFormData({ ...formData, horas_trabalho: e.target.value })}
                  required
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
                    {funcionarias.map((funcionaria) => (
                      <SelectItem
                        key={funcionaria.id}
                        value={funcionaria.id}
                        disabled={funcionaria.status !== 'Ativa'}
                      >
                        {funcionaria.nome} {funcionaria.status !== 'Ativa' ? '(Inativa)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condominio">Condomínio</Label>
                <Select
                  value={formData.id_condominio}
                  onValueChange={(value) => setFormData({ ...formData, id_condominio: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um condomínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {condominios.map((condominio) => (
                      <SelectItem
                        key={condominio.id}
                        value={condominio.id}
                        disabled={condominio.status !== 'Ativo'}
                      >
                        {condominio.nome} {condominio.status !== 'Ativo' ? '(Inativo)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {editingEscala ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Escalas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Funcionária</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalas.map((escala) => (
                <TableRow key={escala.id}>
                  <TableCell>{escala.dia_semana}</TableCell>
                  <TableCell>{escala.funcionaria?.nome || 'N/A'}</TableCell>
                  <TableCell>{escala.condominio?.nome || 'N/A'}</TableCell>
                  <TableCell>{escala.horas_trabalho}h</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(escala)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(escala.id)}
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
