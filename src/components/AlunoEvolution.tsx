import React, { useState } from 'react';
import { Student } from '../types';
import { TrendingUp, Activity, Target, Scale, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export const AlunoEvolution = ({ student }: { student: Student }) => {
  if (!student) return null;
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [adding, setAdding] = useState(false);
  const [newW, setNewW] = useState('');

  const data = (student.weightHistory || []).map(h => ({
    date: h.date.split('-').slice(1).join('/'),
    peso: h.weight,
  }));
  const curr = student.weightHistory?.slice(-1)[0]?.weight;
  const prev = student.weightHistory?.slice(-2)[0]?.weight;
  const diff = curr && prev ? +(curr - prev).toFixed(1) : null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#111] border border-white/10 px-3 py-2 rounded-xl">
          <p className="text-[10px] text-white/40 font-medium">{payload[0].payload.date}</p>
          <p className="text-sm font-bold text-white">{payload[0].value} kg</p>
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
          <h1 className="text-2xl font-black">Evolução</h1>
          <p className="text-white/35 text-sm mt-0.5">Seu progresso ao longo do tempo</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#E8580A] text-white text-xs font-bold shadow-[0_4px_16px_rgba(232,88,10,0.4)] hover:bg-[#d44f08] active:scale-[0.97] transition-all">
          <Plus size={14} /> Peso
        </button>
      </div>

      {/* Stats cards MOVO Progress style */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-[#E8580A]/15 flex items-center justify-center mb-3">
              <Activity size={16} className="text-[#E8580A]" />
            </div>
            <p className="text-[10px] text-white/35 font-medium mb-1">Peso Atual</p>
            <p className="text-3xl font-black text-white">{curr ?? '--'}<span className="text-base ml-0.5 text-white/40">kg</span></p>
            {diff !== null && (
              <p className={`text-xs font-bold mt-1.5 ${diff < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {diff < 0 ? '↓' : '↑'} {Math.abs(diff)}kg vs anterior
              </p>
            )}
          </div>
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center mb-3">
              <Target size={16} className="text-white/40" />
            </div>
            <p className="text-[10px] text-white/35 font-medium mb-1">Meta de Peso</p>
            <p className="text-3xl font-black text-white/50">{(student as any).goalWeight ?? '--'}<span className="text-base ml-0.5">kg</span></p>
            {curr && (student as any).goalWeight && (
              <p className="text-xs text-white/30 font-medium mt-1.5">
                Faltam {Math.abs(curr - (student as any).goalWeight).toFixed(1)}kg
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de peso */}
      <div className="px-5 mb-4">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-white">Histórico de Peso</h3>
            <div className="flex gap-1 bg-[#0A0A0A] border border-white/8 rounded-full p-1">
              {(['7d', '30d', '90d'] as const).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${range === r ? 'bg-[#E8580A] text-white' : 'text-white/30 hover:text-white/60'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {data.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8580A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E8580A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="transparent" fontSize={10} axisLine={false} tickLine={false} dy={8}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 500 }} />
                  <YAxis stroke="transparent" fontSize={10} axisLine={false} tickLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'rgba(255,255,255,0.25)' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="peso" stroke="#E8580A" strokeWidth={2.5}
                    fill="url(#wg)" fillOpacity={1}
                    dot={{ r: 3.5, fill: '#E8580A', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#E8580A', stroke: '#111', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <Scale size={28} className="text-white/15 mb-3" />
              <p className="text-white/25 text-sm font-medium">Nenhum dado registrado</p>
              <button onClick={() => setAdding(true)} className="mt-3 text-[#E8580A] text-xs font-semibold">+ Registrar peso</button>
            </div>
          )}
        </div>
      </div>

      {/* Medidas */}
      {student.measurements?.length > 0 && (
        <div className="px-5">
          <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/6">
              <h3 className="text-base font-bold text-white">Medidas</h3>
            </div>
            {student.measurements.map((m, i) => (
              <div key={i} className={`p-5 ${i < student.measurements.length - 1 ? 'border-b border-white/5' : ''}`}>
                <p className="text-xs font-medium text-white/35 mb-3">{m.date}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Peso', value: m.weight ? `${m.weight}kg` : null },
                    { label: 'Peitoral', value: m.chest ? `${m.chest}cm` : null },
                    { label: 'Cintura', value: m.waist ? `${m.waist}cm` : null },
                    { label: 'Quadril', value: m.hip ? `${m.hip}cm` : null },
                    { label: 'Braço', value: m.arm ? `${m.arm}cm` : null },
                    { label: 'Coxa', value: m.thigh ? `${m.thigh}cm` : null },
                  ].filter(x => x.value).map(item => (
                    <div key={item.label} className="bg-[#0A0A0A] rounded-xl p-2.5 text-center border border-white/5">
                      <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold">{item.label}</p>
                      <p className="text-sm font-black mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal registrar peso */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end app-container">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full bg-[#111] border-t border-white/8 rounded-t-3xl p-6 pb-10">
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-black mb-1">Registrar Peso</h3>
              <p className="text-white/35 text-sm mb-6">Informe seu peso de hoje</p>
              <div className="flex items-center gap-3 mb-6">
                <input value={newW} onChange={e => setNewW(e.target.value)} type="number" placeholder="80.5"
                  className="flex-1 bg-[#0A0A0A] border border-white/8 rounded-2xl p-4 text-3xl font-black text-white placeholder:text-white/15 focus:outline-none focus:border-[#E8580A]/40 transition-colors text-center" />
                <span className="text-xl font-bold text-white/35">kg</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAdding(false)} className="flex-1 py-4 rounded-full border border-white/10 text-white/40 font-bold text-sm hover:bg-white/5 transition-colors">Cancelar</button>
                <button onClick={() => { setAdding(false); setNewW(''); }}
                  className="flex-1 py-4 rounded-full bg-[#E8580A] text-white font-bold text-sm shadow-[0_4px_16px_rgba(232,88,10,0.4)] active:scale-[0.97] transition-all">
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};