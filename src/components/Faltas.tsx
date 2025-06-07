
import { useState } from 'react';
import { useFaltas } from '@/hooks/useFaltas';
import { useFuncionarias } from '@/hooks/useFuncionarias';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Edit, Trash2, AlertTriangle, Loader2, Upload, FileText } from 'lucide-react';

export function Faltas() {
  const { faltas, loading, createFalta, updateFalta, deleteFalta } = useFaltas();
  const { funcionarias } = useFuncionarias();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFalta, setEditingFalta] = useState<any>(null);
  const [formData, setFormData] = useState({
    data: '',
    motivo: '',
    justificativa: false,
    desconto_aplicado: false,
    anexo: '',
    id_funcionaria: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const faltaData = {
        data: formData.data,
        motivo: formData.motivo || null,
        justificativa: formData.justificativa,
        desconto_aplicado: formData.desconto_aplicado,
        anexo: formData.anexo || null,
        id_funcionaria: formData.id_funcionaria || null
      };

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
        anexo: '', 
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
      anexo: falta.anexo || '',
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
      anexo: '', 
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
                <Label htmlFor="data">Data da Falta</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
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
                      <SelectItem key={funcionaria.id} value={funcionaria.id}>
                        {funcionaria.nome}
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

              <div className="space-y-2">
                <Label htmlFor="anexo">Anexo (URL do documento)</Label>
                <div className="flex gap-2">
                  <Input
                    id="anexo"
                    type="url"
                    value={formData.anexo}
                    onChange={(e) => setFormData({ ...formData, anexo: e.target.value })}
                    placeholder="https://exemplo.com/documento.pdf"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
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
                <TableHead>Anexo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faltas.map((falta) => (
                <TableRow key={falta.id}>
                  <TableCell>
                    {new Date(falta.data).toLocaleDateString('pt-BR')}
                  </TableCell>
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
                    <span className={`px-2 py-1 rounded text-xs ${
                      falta.desconto_aplicado 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {falta.desconto_aplicado ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {falta.anexo ? (
                      <a 
                        href={falta.anexo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    ) : (
                      'N/A'
                    )}
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
