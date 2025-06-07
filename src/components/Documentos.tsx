
import { useState } from 'react';
import { useFuncionarias } from '@/hooks/useFuncionarias';
import { useCondominios } from '@/hooks/useCondominios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Download, Eye, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface Documento {
  id: string;
  nome: string;
  tipo: string;
  url: string;
  data_upload: string;
  relacionado_id?: string;
  relacionado_tipo?: 'funcionaria' | 'condominio';
}

export function Documentos() {
  const { funcionarias, loading: loadingFuncionarias } = useFuncionarias();
  const { condominios, loading: loadingCondominios } = useCondominios();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    url: '',
    relacionado_id: '',
    relacionado_tipo: '' as 'funcionaria' | 'condominio' | ''
  });

  const loading = loadingFuncionarias || loadingCondominios;

  // Simular documentos (na implementação real, viria do banco)
  const documentosFuncionarias = funcionarias.flatMap(func => 
    func.documentos && Array.isArray(func.documentos) 
      ? func.documentos.map((doc: any) => ({
          id: `func-${func.id}-${doc.nome || 'doc'}`,
          nome: doc.nome || 'Documento',
          tipo: doc.tipo || 'PDF',
          url: doc.url || '#',
          data_upload: new Date().toISOString(),
          relacionado_id: func.id,
          relacionado_tipo: 'funcionaria' as const,
          funcionaria_nome: func.nome
        }))
      : []
  );

  const documentosCondominios = condominios.filter(cond => cond.contrato_digital).map(cond => ({
    id: `cond-${cond.id}`,
    nome: 'Contrato Digital',
    tipo: 'PDF',
    url: cond.contrato_digital!,
    data_upload: new Date().toISOString(),
    relacionado_id: cond.id,
    relacionado_tipo: 'condominio' as const,
    condominio_nome: cond.nome
  }));

  const todosDocumentos = [...documentosFuncionarias, ...documentosCondominios];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const novoDoc: Documento = {
        id: `novo-${Date.now()}`,
        nome: formData.nome,
        tipo: formData.tipo,
        url: formData.url,
        data_upload: new Date().toISOString(),
        relacionado_id: formData.relacionado_id || undefined,
        relacionado_tipo: formData.relacionado_tipo || undefined
      };

      if (editingDoc) {
        setDocumentos(prev => prev.map(doc => doc.id === editingDoc.id ? { ...novoDoc, id: editingDoc.id } : doc));
      } else {
        setDocumentos(prev => [novoDoc, ...prev]);
      }

      setIsDialogOpen(false);
      setEditingDoc(null);
      setFormData({ nome: '', tipo: '', url: '', relacionado_id: '', relacionado_tipo: '' });
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    }
  };

  const handleEdit = (doc: Documento) => {
    setEditingDoc(doc);
    setFormData({
      nome: doc.nome,
      tipo: doc.tipo,
      url: doc.url,
      relacionado_id: doc.relacionado_id || '',
      relacionado_tipo: doc.relacionado_tipo || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ nome: '', tipo: '', url: '', relacionado_id: '', relacionado_tipo: '' });
    setEditingDoc(null);
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
        <h1 className="text-3xl font-bold text-foreground">Gestão de Documentos</h1>
        <p className="text-muted-foreground">Organize e gerencie todos os documentos do sistema</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">Total de documentos: {todosDocumentos.length + documentos.length}</span>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDoc ? 'Editar Documento' : 'Novo Documento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Documento</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOC">DOC</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="XLS">XLS</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                    <SelectItem value="IMG">Imagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL do Documento</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://exemplo.com/documento.pdf"
                    required
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relacionado_tipo">Relacionado a</Label>
                <Select
                  value={formData.relacionado_tipo}
                  onValueChange={(value) => setFormData({ ...formData, relacionado_tipo: value as any, relacionado_id: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    <SelectItem value="funcionaria">Funcionária</SelectItem>
                    <SelectItem value="condominio">Condomínio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.relacionado_tipo && (
                <div className="space-y-2">
                  <Label htmlFor="relacionado_id">
                    {formData.relacionado_tipo === 'funcionaria' ? 'Funcionária' : 'Condomínio'}
                  </Label>
                  <Select
                    value={formData.relacionado_id}
                    onValueChange={(value) => setFormData({ ...formData, relacionado_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.relacionado_tipo === 'funcionaria' 
                        ? funcionarias.map((func) => (
                            <SelectItem key={func.id} value={func.id}>
                              {func.nome}
                            </SelectItem>
                          ))
                        : condominios.map((cond) => (
                            <SelectItem key={cond.id} value={cond.id}>
                              {cond.nome}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDoc ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos os Documentos</TabsTrigger>
          <TabsTrigger value="funcionarias">Funcionárias</TabsTrigger>
          <TabsTrigger value="condominios">Condomínios</TabsTrigger>
          <TabsTrigger value="gerais">Gerais</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Relacionado a</TableHead>
                    <TableHead>Data Upload</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...todosDocumentos, ...documentos].map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.nome}</TableCell>
                      <TableCell>{doc.tipo}</TableCell>
                      <TableCell>
                        {doc.relacionado_tipo === 'funcionaria' && (doc as any).funcionaria_nome}
                        {doc.relacionado_tipo === 'condominio' && (doc as any).condominio_nome}
                        {!doc.relacionado_tipo && 'Geral'}
                      </TableCell>
                      <TableCell>
                        {new Date(doc.data_upload).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(doc)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionarias">
          <Card>
            <CardHeader>
              <CardTitle>Documentos das Funcionárias</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionária</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentosFuncionarias.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{(doc as any).funcionaria_nome}</TableCell>
                      <TableCell>{doc.nome}</TableCell>
                      <TableCell>{doc.tipo}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="condominios">
          <Card>
            <CardHeader>
              <CardTitle>Documentos dos Condomínios</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Condomínio</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentosCondominios.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{(doc as any).condominio_nome}</TableCell>
                      <TableCell>{doc.nome}</TableCell>
                      <TableCell>{doc.tipo}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gerais">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Upload</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.filter(doc => !doc.relacionado_tipo).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.nome}</TableCell>
                      <TableCell>{doc.tipo}</TableCell>
                      <TableCell>
                        {new Date(doc.data_upload).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={doc.url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(doc)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
