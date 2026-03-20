import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle2, Clock, ArrowUpRight, Calendar, Users, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';

function cx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export const PersonalFinance = ({ students }: { students: any[] }) => {
  const total    = students.reduce((a, s) => a + s.monthlyFee, 0);
  const recebido = students.filter(s => s.paymentStatus === 'pago').reduce((a, s) => a + s.monthlyFee, 0);
  const pendente = total - recebido;
  const recPct   = Math.round((recebido / Math.max(total, 1)) * 100);

  const monthData = [
    { m: 'Out', v: 8200 }, { m: 'Nov', v: 9400 }, { m: 'Dez', v: 8700 },
    { m: 'Jan', v: 10500 }, { m: 'Fev', v: 9800 }, { m: 'Mar', v: total },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111] border border-white/10 px-3 py-2.5 rounded-xl shadow-2xl">
          <p className="text-[10px] text-white/40 font-medium mb-1">{payload[0].payload.m} 2024</p>
          <p className="text-sm font-semibold text-white">
            R$ {payload[0].value.toLocaleString('pt-BR')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-28 overflow-y-auto">

      {/* Header */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Finanças</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111] border border-white/8">
          <Calendar size={11} className="text-white/40" />
          <span className="text-[11px] font-medium text-white/50">Mar 2024</span>
        </div>
      </div>

      {/* Card Hero — Receita */}
      <div className="px-5 mb-4">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-white/40 font-medium mb-1">Receita Projetada</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-white/30 font-medium">R$</span>
                <h2 className="text-5xl font-black text-white leading-none tracking-tight">
                  {total.toLocaleString('pt-BR')}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ArrowUpRight size={13} />
              <span className="text-[11px] font-bold">+12,5%</span>
            </div>
          </div>

          {/* Barra de cobrança */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/40 font-medium">Cobrança do mês</span>
              <span className="text-[13px] font-bold text-white">{recPct}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${recPct}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-[#E8580A] to-[#FF8A4C] rounded-full"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4">
            <p className="text-[10px] text-white/30 font-medium italic">
              Receita consolidada com base nos planos ativos.
            </p>
          </div>
        </div>
      </div>

      {/* Cards Recebido / Pendente */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <div className="mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
                <TrendingUp size={15} />
              </div>
            </div>
            <p className="text-[11px] text-white/40 font-medium mb-1">Recebido</p>
            <p className="text-2xl font-black text-white leading-none">
              <span className="text-xs text-white/30 font-medium mr-1">R$</span>
              {recebido.toLocaleString('pt-BR')}
            </p>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
              <Users size={10} className="text-white/25" />
              <p className="text-[10px] text-white/35 font-medium">
                {students.filter(s => s.paymentStatus === 'pago').length} alunos em dia
              </p>
            </div>
          </div>

          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <div className="mb-4">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 w-fit">
                <TrendingDown size={15} />
              </div>
            </div>
            <p className="text-[11px] text-white/40 font-medium mb-1">Pendente</p>
            <p className="text-2xl font-black text-white leading-none">
              <span className="text-xs text-white/30 font-medium mr-1">R$</span>
              {pendente.toLocaleString('pt-BR')}
            </p>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
              <Clock size={10} className="text-white/25" />
              <p className="text-[10px] text-white/35 font-medium">
                {students.filter(s => s.paymentStatus !== 'pago').length} com pendência
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="px-5 mb-4">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white text-sm font-semibold">Receita Mensal</h3>
              <p className="text-[10px] text-white/35 font-medium mt-0.5">Últimos 6 meses</p>
            </div>
            <p className="text-[11px] text-white/40 font-medium">Média R$ 9.400</p>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8580A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8580A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="m"
                  stroke="rgba(255,255,255,0.0)"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 500 }}
                />
                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#E8580A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  animationDuration={2000}
                  activeDot={{ r: 5, fill: '#E8580A', stroke: '#111', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lista de Alunos */}
      <div className="px-5">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white text-sm font-semibold">Alunos</h3>
            <button className="flex items-center gap-1.5 text-[11px] font-medium text-[#E8580A]/70 hover:text-[#E8580A] transition-colors">
              Exportar <ArrowRight size={11} />
            </button>
          </div>

          <div className="space-y-3">
            {students.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/8 rounded-xl hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-white/8 overflow-hidden">
                      {s.avatar ? (
                        <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-semibold text-white/30 text-sm">
                          {s.name[0]}
                        </div>
                      )}
                    </div>
                    <div className={[
                      "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-lg border-2 border-[#0A0A0A] flex items-center justify-center",
                      s.paymentStatus === 'pago' ? 'bg-emerald-500' : s.paymentStatus === 'atrasado' ? 'bg-red-500' : 'bg-amber-500'
                    ].join(' ')}>
                      {s.paymentStatus === 'pago'
                        ? <CheckCircle2 size={8} className="text-white" />
                        : <Clock size={8} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/85">{s.name}</p>
                    <p className="text-[10px] text-white/30 font-medium mt-0.5">Vence dia {s.paymentDueDay}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[13px] font-bold text-white/80">R$ {s.monthlyFee}</p>
                  <span className={[
                    "text-[10px] font-medium px-2.5 py-1 rounded-full inline-block mt-0.5",
                    s.paymentStatus === 'pago'
                      ? 'text-emerald-400 bg-emerald-500/15'
                      : s.paymentStatus === 'atrasado'
                      ? 'text-red-400 bg-red-500/15'
                      : 'text-amber-400 bg-amber-500/15'
                  ].join(' ')}>
                    {s.paymentStatus === 'pago' ? 'Pago' : s.paymentStatus === 'atrasado' ? 'Atrasado' : 'Pendente'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 mt-4">
            <p className="text-[10px] text-white/30 font-medium italic">
              Pagamentos em atraso impactam sua receita mensal projetada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};