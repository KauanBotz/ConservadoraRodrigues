import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, AlertTriangle, DollarSign, FileText, Loader2 } from "lucide-react";
import { useFuncionarias } from "@/hooks/useFuncionarias";
import { useCondominios } from "@/hooks/useCondominios";
import { useFaltas } from "@/hooks/useFaltas";
import { useSalarios } from "@/hooks/useSalarios";
import { useEscalas } from "@/hooks/useEscalas";

export function Dashboard() {
  const { funcionarias = [], loading: loadingFuncionarias } = useFuncionarias();
  const { condominios = [], loading: loadingCondominios } = useCondominios();
  const { faltas = [], loading: loadingFaltas } = useFaltas();
  const { salarios = [], loading: loadingSalarios } = useSalarios();
  const { escalas = [], loading: loadingEscalas } = useEscalas();

  const isLoading = loadingFuncionarias || loadingCondominios || loadingFaltas || loadingSalarios || loadingEscalas;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const mapNumeroParaDiaString: { [key: number]: string } = {
    0: 'domingo',
    1: 'segunda',
    2: 'terça',
    3: 'quarta',
    4: 'quinta',
    5: 'sexta',
    6: 'sábado'
  };
  const diaSemanaAtual = mapNumeroParaDiaString[hoje.getDay()];

  const gastoSalarios = funcionarias.reduce((total, funcionaria) => {
    if (funcionaria.status !== 'Ativa' || !funcionaria.salario_base) {
      return total;
    }
    const salarioBase = Number(funcionaria.salario_base) || 0;
    const faltasDaFunc = faltas.filter(f =>
      f.id_funcionaria === funcionaria.id &&
      new Date(f.data).getMonth() === mesAtual &&
      new Date(f.data).getFullYear() === anoAtual &&
      f.justificativa === false
    );
    const desconto = faltasDaFunc.length * (salarioBase / 30);
    return total + (salarioBase - desconto);
  }, 0);

  const totalPassagens = funcionarias.reduce((total, funcionaria) => {
    if (funcionaria.status !== 'Ativa' || !funcionaria.valor_passagem || !funcionaria.horas_semanais) {
      return total;
    }
    const diasTrabalhadosPorSemana = funcionaria.horas_semanais / 8;
    const custoMensalPassagens = funcionaria.valor_passagem * diasTrabalhadosPorSemana * 4.5;
    return total + custoMensalPassagens;
  }, 0);

  // Alterado para mostrar as faltas do mês atual inteiro
  const faltasDoMes = faltas.filter(f => {
    const dataFalta = new Date(f.data);
    return dataFalta.getMonth() === mesAtual && dataFalta.getFullYear() === anoAtual;
  });

  const escalasHoje = escalas.filter(escala => {
    if (!escala.dia_semana) return false;
    const diaDaEscala = escala.dia_semana.trim().toLowerCase().replace('-feira', '');
    return diaDaEscala === diaSemanaAtual;
  });

  const stats = {
    totalFuncionarias: funcionarias.filter(f => f.status === 'Ativa').length,
    totalCondominios: condominios.filter(c => c.status === 'Ativo').length,
    faltasEstesMes: faltasDoMes.length,
    gastoSalarios,
    totalPassagens,
    escalasAtivas: escalas.length
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
          <p className="font-medium">{hoje.toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total de Funcionárias" icon={<Users />} value={stats.totalFuncionarias} color="primary" subtitle="Funcionárias ativas" />
        <DashboardCard title="Condomínios Atendidos" icon={<Building2 />} value={stats.totalCondominios} color="secondary" subtitle="Contratos ativos" />
        <DashboardCard title="Faltas Este Mês" icon={<AlertTriangle />} value={stats.faltasEstesMes} color="destructive" subtitle="Faltas registradas" />
        <DashboardCard title="Gasto com Salários" icon={<DollarSign />} value={`R$ ${stats.gastoSalarios.toFixed(2)}`} color="primary" subtitle="Valor mensal" />
        <DashboardCard title="Total Passagens" icon={<FileText />} value={`R$ ${stats.totalPassagens.toFixed(2)}`} color="secondary" subtitle="Gastos mensais" />
        <DashboardCard title="Escalas Ativas" icon={<Calendar />} value={stats.escalasAtivas} color="primary" subtitle="Esta semana" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Faltas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faltasDoMes.slice(0, 3).map((falta, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{falta.funcionaria?.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(falta.data).toLocaleDateString('pt-BR')} - {falta.justificativa ? "Com justificativa" : "Sem justificativa"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${falta.justificativa ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"}`}>
                    {falta.justificativa ? "Justificada" : "Desconto aplicado"}
                  </span>
                </div>
              ))}
              {faltasDoMes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma falta registrada este mês.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Escalas ({diaSemanaAtual.charAt(0).toUpperCase() + diaSemanaAtual.slice(1)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {escalasHoje.length > 0 ? (
                escalasHoje.map((escala, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{escala.condominio?.nome}</p>
                      <p className="text-sm text-muted-foreground">{escala.funcionaria?.nome}</p>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {escala.dia_semana}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma escala para hoje.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardCard({ title, icon, value, subtitle, color }: any) {
  return (
    <Card className={`hover:shadow-lg transition-shadow border-l-4 border-l-${color}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-4 w-4 text-${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}