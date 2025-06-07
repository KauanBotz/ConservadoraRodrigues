
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, AlertTriangle, DollarSign, FileText } from "lucide-react";
import { useFuncionarias } from "@/hooks/useFuncionarias";
import { useCondominios } from "@/hooks/useCondominios";
import { useFaltas } from "@/hooks/useFaltas";
import { useSalarios } from "@/hooks/useSalarios";
import { useEscalas } from "@/hooks/useEscalas";

export function Dashboard() {
  // Mock data - em produção viria do Supabase
  const stats = {
    totalFuncionarias: useFuncionarias().funcionarias.length,
    totalCondominios: useCondominios().condominios.length,
    faltasEstesMes: useFaltas().faltas.length,
    gastoSalarios: useSalarios().salarios.reduce((total, salario) => total + (salario.salario_final || 0), 0),
    totalPassagens: useSalarios().salarios.reduce((total, salario) => total + (salario.total_passagens || 0), 0),
    escalasAtivas: useEscalas().escalas.length
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema da conservadora</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Última atualização</p>
          <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Funcionárias
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalFuncionarias}</div>
            <p className="text-xs text-muted-foreground">
              Funcionárias ativas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Condomínios Atendidos
            </CardTitle>
            <Building2 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.totalCondominios}</div>
            <p className="text-xs text-muted-foreground">
              Contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faltas Este Mês
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.faltasEstesMes}</div>
            <p className="text-xs text-muted-foreground">
              Faltas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gasto com Salários
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.gastoSalarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor mensal
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Passagens
            </CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              R$ {stats.totalPassagens.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos mensais
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escalas Ativas
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.escalasAtivas}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      Faltas Recentes
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {useFaltas().faltas.slice(0, 3).map((falta, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="font-medium">{falta.funcionaria?.nome}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(falta.data).toLocaleDateString('pt-BR')} - {falta.justificativa ? "Com justificativa" : "Sem justificativa"}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${falta.justificativa ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"}`}>
            {falta.justificativa ?? "Desconto aplicado"}
          </span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-primary" />
      Próximas Escalas
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {useEscalas().escalas.slice(0, 3).map((escala, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="font-medium">{escala.condominio?.nome}</p>
            <p className="text-sm text-muted-foreground">
              {escala.funcionaria?.nome}
            </p>
          </div>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
            {new Date(escala.data).toLocaleDateString('pt-BR', { weekday: 'long' })}
          </span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

      </div>
    </div>
  );
}
