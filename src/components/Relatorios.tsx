
import { useState } from 'react';
import { useSalarios } from '@/hooks/useSalarios';
import { useFuncionarias } from '@/hooks/useFuncionarias';
import { useFaltas } from '@/hooks/useFaltas';
import { useEscalas } from '@/hooks/useEscalas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { BarChart3, Users, Calendar, AlertTriangle, DollarSign, Loader2, Download } from 'lucide-react';

export function Relatorios() {
  const { salarios, loading: loadingSalarios } = useSalarios();
  const { funcionarias, loading: loadingFuncionarias } = useFuncionarias();
  const { faltas, loading: loadingFaltas } = useFaltas();
  const { escalas, loading: loadingEscalas } = useEscalas();
  
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedFuncionaria, setSelectedFuncionaria] = useState('');

  const loading = loadingSalarios || loadingFuncionarias || loadingFaltas || loadingEscalas;

  // Estatísticas gerais
  const totalFuncionarias = funcionarias.length;
  const totalFaltas = faltas.length;
  const totalEscalas = escalas.length;
  const totalSalarios = salarios.reduce((acc, sal) => acc + (sal.salario_final || 0), 0);

  // Filtrar dados por mês
  const filterByMonth = (data: any[], dateField: string) => {
    if (!selectedMonth) return data;
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      const [year, month] = selectedMonth.split('-');
      return itemDate.getFullYear() === parseInt(year) && 
             itemDate.getMonth() === parseInt(month) - 1;
    });
  };

  // Filtrar dados por funcionária
  const filterByFuncionaria = (data: any[]) => {
    if (!selectedFuncionaria) return data;
    return data.filter(item => item.id_funcionaria === selectedFuncionaria);
  };

  const filteredFaltas = filterByFuncionaria(filterByMonth(faltas, 'data'));
  const filteredEscalas = filterByFuncionaria(filterByMonth(escalas, 'data'));
  const filteredSalarios = filterByFuncionaria(filterByMonth(salarios, 'mes'));

  // Relatório por funcionária
  const relatorioFuncionarias = funcionarias.map(funcionaria => {
    const faltasFuncionaria = faltas.filter(f => f.id_funcionaria === funcionaria.id);
    const escalasFuncionaria = escalas.filter(e => e.id_funcionaria === funcionaria.id);
    const salariosFuncionaria = salarios.filter(s => s.id_funcionaria === funcionaria.id);
    
    const totalHoras = escalasFuncionaria.reduce((acc, e) => acc + e.horas_trabalho, 0);
    const totalSalarioFinal = salariosFuncionaria.reduce((acc, s) => acc + (s.salario_final || 0), 0);
    
    return {
      funcionaria: funcionaria.nome,
      totalFaltas: faltasFuncionaria.length,
      totalHoras,
      totalSalario: totalSalarioFinal,
      salarioBase: funcionaria.salario_base || 0
    };
  });

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
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Análise e estatísticas do sistema</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os meses</SelectItem>
                <SelectItem value="2024-01">Janeiro 2024</SelectItem>
                <SelectItem value="2024-02">Fevereiro 2024</SelectItem>
                <SelectItem value="2024-03">Março 2024</SelectItem>
                <SelectItem value="2024-04">Abril 2024</SelectItem>
                <SelectItem value="2024-05">Maio 2024</SelectItem>
                <SelectItem value="2024-06">Junho 2024</SelectItem>
                <SelectItem value="2024-07">Julho 2024</SelectItem>
                <SelectItem value="2024-08">Agosto 2024</SelectItem>
                <SelectItem value="2024-09">Setembro 2024</SelectItem>
                <SelectItem value="2024-10">Outubro 2024</SelectItem>
                <SelectItem value="2024-11">Novembro 2024</SelectItem>
                <SelectItem value="2024-12">Dezembro 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select value={selectedFuncionaria} onValueChange={setSelectedFuncionaria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a funcionária" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as funcionárias</SelectItem>
                {funcionarias.map((funcionaria) => (
                  <SelectItem key={funcionaria.id} value={funcionaria.id}>
                    {funcionaria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </CardContent>
      </Card>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalFuncionarias}</p>
                <p className="text-sm text-muted-foreground">Funcionárias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{filteredEscalas.length}</p>
                <p className="text-sm text-muted-foreground">Escalas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{filteredFaltas.length}</p>
                <p className="text-sm text-muted-foreground">Faltas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  R$ {filteredSalarios.reduce((acc, s) => acc + (s.salario_final || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Total Salários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório detalhado por funcionária */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório por Funcionária</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionária</TableHead>
                <TableHead>Salário Base</TableHead>
                <TableHead>Total Faltas</TableHead>
                <TableHead>Total Horas</TableHead>
                <TableHead>Total Recebido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorioFuncionarias.map((rel, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{rel.funcionaria}</TableCell>
                  <TableCell>R$ {rel.salarioBase.toFixed(2)}</TableCell>
                  <TableCell>{rel.totalFaltas}</TableCell>
                  <TableCell>{rel.totalHoras}h</TableCell>
                  <TableCell>R$ {rel.totalSalario.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Faltas detalhadas */}
      {filteredFaltas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Faltas no Período</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Funcionária</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Justificada</TableHead>
                  <TableHead>Desconto Aplicado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaltas.map((falta) => (
                  <TableRow key={falta.id}>
                    <TableCell>
                      {new Date(falta.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{falta.funcionaria?.nome}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
