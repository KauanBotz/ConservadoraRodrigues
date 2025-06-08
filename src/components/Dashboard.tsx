import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, AlertTriangle, DollarSign, FileText } from "lucide-react";
import { useFuncionarias } from "@/hooks/useFuncionarias";
import { useCondominios } from "@/hooks/useCondominios";
import { useFaltas } from "@/hooks/useFaltas";
import { useSalarios } from "@/hooks/useSalarios";
import { useEscalas } from "@/hooks/useEscalas";

export function Dashboard() {
  const { funcionarias = [] } = useFuncionarias();
  const { condominios = [] } = useCondominios();
  const { faltas = [] } = useFaltas();
  const { salarios = [] } = useSalarios();
  const { escalas = [] } = useEscalas();

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const mapDia = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const diaSemanaAtual = mapDia[hoje.getDay()];

  const quintoDiaUtil = (() => {
    let dia = 1;
    let uteis = 0;
    while (uteis < 5) {
      const data = new Date(anoAtual, mesAtual, dia);
      const diaSemana = data.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) uteis++;
      if (uteis < 5) dia++;
    }
    return dia;
  })();

  const gastoSalarios = salarios.reduce((total, salario) => {
    if (!salario.id_funcionaria) return total;
    const faltasDaFunc = faltas.filter(f =>
      f.id_funcionaria === salario.id_funcionaria &&
      new Date(f.data).getMonth() === mesAtual &&
      new Date(f.data).getFullYear() === anoAtual
    );
    const salarioBase = Number(salario.salario_base) || 0;
    const desconto = faltasDaFunc.reduce((acc, falta) =>
      acc + (falta.justificativa === false ? salarioBase / 30 : 0), 0
    );
    const salarioFinal = diaAtual > quintoDiaUtil ? salarioBase - desconto : salarioBase;
    return total + salarioFinal;
  }, 0);

  const totalPassagens = salarios.reduce((total, salario) => {
    if (!salario.id_funcionaria) return total;
    const passagens = Number(salario.total_passagens);
    return total + (isNaN(passagens) ? 0 : passagens);
  }, 0);

  const faltasRecentes = faltas.filter(f => {
    const dataFalta = new Date(f.data);
    const diasDiferenca = (hoje.getTime() - dataFalta.getTime()) / (1000 * 60 * 60 * 24);
    return diasDiferenca <= 15;
  });

  const escalasHoje = escalas.filter(e =>
    e.dia_da_semana?.toLowerCase().includes(diaSemanaAtual)
  );

  const stats = {
    totalFuncionarias: funcionarias.filter(f => f.status === 'Ativa').length,
    totalCondominios: condominios.filter(c => c.status === 'Ativo').length,
    faltasEstesMes: faltas.filter(f => {
      const d = new Date(f.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    }).length,
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
        <DashboardCard title="Gasto com Salários" icon={<DollarSign />} value={`R$ ${stats.gastoSalarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="primary" subtitle="Valor mensal" />
        <DashboardCard title="Total Passagens" icon={<FileText />} value={`R$ ${stats.totalPassagens.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="secondary" subtitle="Gastos mensais" />
        <DashboardCard title="Escalas Ativas" icon={<Calendar />} value={stats.escalasAtivas} color="primary" subtitle="Esta semana" />
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
              {faltasRecentes.slice(0, 3).map((falta, i) => (
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Escalas ({diaSemanaAtual})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {escalasHoje.map((escala, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{escala.condominio?.nome}</p>
                    <p className="text-sm text-muted-foreground">{escala.funcionaria?.nome}</p>
                  </div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {escala.dia_da_semana}
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
