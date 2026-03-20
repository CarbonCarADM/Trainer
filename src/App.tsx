/**
 * @license SPDX-License-Identifier: Apache-2.0
 * TrainerPro — Refatoração completa inspirada no MOVO
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonalFinance } from './components/PersonalFinance';
import { AlunoEvolution } from './components/AlunoEvolution';
import { AlunoWorkouts } from './components/AlunoWorkouts';
import { AlunoProfile } from './components/AlunoProfile';
import {
  Users, TrendingUp, Plus, Dumbbell, Home, Settings, Play,
  CheckCircle2, Clock, ArrowLeft, Search, Trash2, Phone,
  User, Flame, Sparkles, ChevronRight, Bell, Edit3, Save,
  X, Calendar, MapPin, FileText, BookOpen,
  AlertTriangle, Activity, DollarSign, BarChart2,
  ChevronDown, Check, Target, Zap, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BRAND, INITIAL_STUDENTS } from './constants';
import { Student, Workout, Exercise, WeekPlan } from './types';

/* ─── helpers ─── */
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
const engLabel = (n: number) => n >= 70 ? 'Engajado' : n >= 40 ? 'Atenção' : 'Risco';
const engColor = (n: number) => n >= 70 ? 'emerald' : n >= 40 ? 'amber' : 'red';
const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_LETTER = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/* ─── Avatar ─── */
const Avatar = ({ src, name, size = 44, ring = false }: { src?: string; name: string; size?: number; ring?: boolean }) => (
  <div style={{ width: size, height: size }}
    className={cx('rounded-2xl bg-[#E8580A]/20 flex items-center justify-center overflow-hidden flex-shrink-0 font-bold text-[#E8580A]',
      ring ? 'ring-2 ring-[#E8580A]/40' : '')}>
    {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span style={{ fontSize: size * 0.38 }}>{name[0]}</span>}
  </div>
);

/* ─── Badge pill ─── */
const Pill = ({ children, color = 'orange' }: { children: React.ReactNode; color?: string }) => {
  const map: Record<string, string> = {
    orange: 'bg-[#E8580A] text-white',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    red: 'bg-red-500/15 text-red-400',
    amber: 'bg-amber-500/15 text-amber-400',
    gray: 'bg-white/8 text-white/50',
  };
  return <span className={cx('px-2.5 py-1 rounded-full text-[10px] font-bold', map[color] || map.gray)}>{children}</span>;
};

/* ─── Section header ─── */
const SectionHeader = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-base font-bold text-white">{title}</h3>
    {action && <button onClick={onAction} className="text-[#E8580A] text-xs font-semibold">{action}</button>}
  </div>
);

/* ─── Input ─── */
const Inp = ({ label, value, onChange, placeholder = '', type = 'text', textarea = false, required = false }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; textarea?: boolean; required?: boolean }) => (
  <div>
    <label className="text-xs text-white/40 font-medium block mb-1.5">{label}{required && <span className="text-[#E8580A] ml-1">*</span>}</label>
    {textarea
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full bg-[#0A0A0A] border border-white/8 rounded-xl p-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E8580A]/40 transition-colors resize-none leading-relaxed" />
      : <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder}
        className="w-full bg-[#0A0A0A] border border-white/8 rounded-xl p-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E8580A]/40 transition-colors" />
    }
  </div>
);

/* ─── Quiz Option ─── */
const QuizOption = ({ label, sub, selected, onSelect }: { label: string; sub?: string; selected: boolean; onSelect: () => void }) => (
  <button onClick={onSelect}
    className={cx('w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left',
      selected ? 'bg-[#E8580A]/10 border-[#E8580A]/50 text-white' : 'bg-[#111] border-white/8 text-white/70 hover:border-white/20')}>
    <div>
      <p className={cx('text-sm font-semibold', selected ? 'text-white' : 'text-white/80')}>{label}</p>
      {sub && <p className="text-[11px] text-white/35 mt-0.5">{sub}</p>}
    </div>
    <div className={cx('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-all',
      selected ? 'border-[#E8580A] bg-[#E8580A]' : 'border-white/20')}>
      {selected && <Check size={11} className="text-white" />}
    </div>
  </button>
);

/* ═══════════════════════════════════════ APP ═══════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState<'splash' | 'acesso' | 'personal' | 'aluno'>('splash');
  const [pTab, setPTab] = useState<'inicio' | 'clientes' | 'treinos' | 'financas'>('inicio');
  const [aTab, setATab] = useState<'inicio' | 'treino' | 'evolucao' | 'treinos' | 'perfil'>('inicio');
  const [students, setStudents] = useState<Student[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [exIdx, setExIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [wDone, setWDone] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoad, setAiLoad] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [studentDetail, setStudentDetail] = useState<Student | null>(null);
  const [mode, setMode] = useState<'list' | 'detail' | 'new' | 'editProfile' | 'newWorkout' | 'weekPlan'>('list');
  const [alunoPhone, setAlunoPhone] = useState('');
  const [alunoPhoneError, setAlunoPhoneError] = useState('');
  const [loggedStudent, setLoggedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const s = localStorage.getItem('tp_v5');
    setStudents(s ? JSON.parse(s) : INITIAL_STUDENTS);
    const t = setTimeout(() => setView('acesso'), 2400);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (students.length) localStorage.setItem('tp_v5', JSON.stringify(students)); }, [students]);
  useEffect(() => {
    if (!timerOn) return;
    if (timer <= 0) { setTimerOn(false); return; }
    const id = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [timerOn, timer]);

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    pending: students.filter(s => s.paymentStatus !== 'pago').length,
    revenue: students.reduce((a, s) => a + s.monthlyFee, 0),
    avgEng: students.length ? Math.round(students.reduce((a, s) => a + s.engagementScore, 0) / students.length) : 0,
    atRisk: students.filter(s => s.engagementScore < 40).length,
  }), [students]);

  const nextEx = () => {
    if (!activeWorkout) return;
    const next = exIdx + 1;
    if (next < activeWorkout.exercises.length) {
      setExIdx(next);
      setTimer(parseInt(activeWorkout.exercises[exIdx].rest) || 60);
      setTimerOn(true);
    } else {
      setWDone(true);
      const sid = loggedStudent?.id || '1';
      setStudents(ss => ss.map(s => s.id === sid ? { ...s, xp: s.xp + 100, streak: s.streak + 1, lastWorkoutDate: new Date().toISOString().split('T')[0] } : s));
    }
  };
  const updateStudent = (updated: Student) => {
    setStudents(ss => ss.map(s => s.id === updated.id ? updated : s));
    if (loggedStudent?.id === updated.id) setLoggedStudent(updated);
  };
  const getStudentLive = (id: string) => students.find(s => s.id === id);

  /* ══ SPLASH ══ */
  if (view === 'splash') return (
    <div className="fixed inset-0 app-container bg-[#0A0A0A] overflow-hidden flex flex-col justify-end">
      <motion.div initial={{ scale: 1.06, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.8, ease: 'easeOut' }} className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
      </motion.div>
      <motion.div initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="relative z-10 px-6 pb-14 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-[#E8580A] flex items-center justify-center"><Dumbbell size={18} className="text-white" /></div>
            <span className="text-sm font-bold text-white/50 tracking-widest uppercase">TrainerPro</span>
          </div>
          <h1 className="text-[2.8rem] font-black leading-[1.05] text-white tracking-tight">Seja Ativo.<br />Seja Focado.<br />Seja o <span className="text-[#E8580A]">Melhor.</span></h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('acesso')} className="flex-1 py-4 rounded-full bg-[#E8580A] text-white font-bold text-sm shadow-[0_6px_24px_rgba(232,88,10,0.5)] active:scale-[0.97] transition-all">Começar</button>
          <button onClick={() => setView('acesso')} className="flex-1 py-4 rounded-full bg-white/10 border border-white/12 text-white font-bold text-sm active:scale-[0.97] transition-all backdrop-blur-sm">Entrar</button>
        </div>
      </motion.div>
    </div>
  );

  /* ══ ACESSO ══ */
  if (view === 'acesso') {
    const loginAluno = () => {
      const clean = alunoPhone.replace(/\D/g, '');
      const found = students.find(s => s.whatsapp.replace(/\D/g, '').endsWith(clean) || clean.endsWith(s.whatsapp.replace(/\D/g, '').slice(-9)));
      if (found) { setLoggedStudent(found); setView('aluno'); setAlunoPhoneError(''); }
      else setAlunoPhoneError('Número não encontrado. Verifique com seu personal.');
    };
    return (
      <div className="app-container min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#E8580A]/6 rounded-full blur-[100px] pointer-events-none" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-[#E8580A]/15 border border-[#E8580A]/25 flex items-center justify-center mx-auto">
              <Dumbbell size={30} className="text-[#E8580A]" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Bem-vindo ao <span className="text-[#E8580A]">TrainerPro</span></h2>
            <p className="text-white/35 text-sm">Escolha seu nível de acesso.</p>
          </div>

          <div className="space-y-3">
            {/* Personal */}
            <button onClick={() => setView('personal')} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-[#E8580A] text-white hover:bg-[#d44f08] active:scale-[0.98] transition-all shadow-[0_6px_28px_rgba(232,88,10,0.4)]">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Settings size={20} /></div>
              <div className="text-left flex-1"><p className="font-bold text-base">Acesso Personal</p><p className="text-white/70 text-xs font-normal mt-0.5">Gerenciar alunos e treinos</p></div>
              <ChevronRight size={18} className="text-white/60" />
            </button>

            {/* Aluno */}
            <div className="bg-[#111] border border-white/8 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center"><Users size={20} className="text-white/50" /></div>
                <div><p className="font-bold text-base">Acesso Aluno</p><p className="text-white/35 text-xs mt-0.5">Entre com seu WhatsApp cadastrado</p></div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input value={alunoPhone} onChange={e => setAlunoPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && loginAluno()}
                    type="tel" placeholder="Ex: 11 99999-0000"
                    className="w-full bg-[#0A0A0A] border border-white/8 rounded-xl py-3 pl-9 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E8580A]/40 transition-colors" />
                </div>
                {alunoPhoneError && <p className="text-red-400 text-xs flex items-center gap-1.5"><AlertTriangle size={11} />{alunoPhoneError}</p>}
                <button onClick={loginAluno} className="w-full py-3 rounded-full bg-white/8 border border-white/10 text-white font-bold text-sm hover:bg-white/12 active:scale-[0.98] transition-all">
                  Entrar como Aluno
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════ PAINEL PERSONAL ═══════════════════════ */

  /* ── INÍCIO ── */
  const PInicio = () => {
    const recebido = students.filter(s => s.paymentStatus === 'pago').reduce((a, s) => a + s.monthlyFee, 0);
    const pendente = students.filter(s => s.paymentStatus !== 'pago').reduce((a, s) => a + s.monthlyFee, 0);
    const pagoPct = Math.round((recebido / Math.max(recebido + pendente, 1)) * 100);
    const alertStudents = students.filter(s => s.engagementScore < 40 || s.paymentStatus === 'atrasado');
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const engCounts = {
      high: students.filter(s => s.engagementScore >= 70).length,
      mid: students.filter(s => s.engagementScore >= 40 && s.engagementScore < 70).length,
      low: students.filter(s => s.engagementScore < 40).length,
    };
    const totalEng = Math.max(engCounts.high + engCounts.mid + engCounts.low, 1);

    return (
      <div className="pb-28 overflow-y-auto">
        {/* Header */}
        <div className="px-5 pt-6 pb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/35 font-medium mb-0.5 capitalize">{today}</p>
            <h1 className="text-2xl font-black tracking-tight">{BRAND.nome}</h1>
          </div>
          <div className="flex gap-2">
            <button className="relative w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
              <Bell size={18} />
              {alertStudents.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E8580A] text-white text-[9px] font-black flex items-center justify-center">{alertStudents.length}</span>}
            </button>
            <button className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"><Settings size={18} /></button>
          </div>
        </div>

        {/* Stats rápidos estilo MOVO Progress */}
        <div className="px-5 mb-4">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <SectionHeader title="Progresso Geral" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-[#E8580A]/15 flex items-center justify-center"><Users size={15} className="text-[#E8580A]" /></div>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Alunos Ativos</p>
                    <p className="text-base font-black text-white leading-none mt-0.5">{stats.active}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Activity size={15} className="text-emerald-400" /></div>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Engajamento</p>
                    <p className="text-base font-black text-white leading-none mt-0.5">{stats.avgEng}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center"><AlertTriangle size={15} className="text-amber-400" /></div>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Em Risco</p>
                    <p className="text-base font-black text-white leading-none mt-0.5">{stats.atRisk}</p>
                  </div>
                </div>
              </div>

              {/* Barra segmentada de engajamento */}
              <div>
                <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-2">
                  <div style={{ width: `${(engCounts.high / totalEng) * 100}%` }} className="h-full bg-emerald-500" />
                  <div style={{ width: `${(engCounts.mid / totalEng) * 100}%` }} className="h-full bg-amber-500" />
                  <div style={{ width: `${(engCounts.low / totalEng) * 100}%` }} className="h-full bg-red-500" />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[10px] text-white/40 font-medium">Engajados {engCounts.high}</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /><span className="text-[10px] text-white/40 font-medium">Atenção {engCounts.mid}</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /><span className="text-[10px] text-white/40 font-medium">Risco {engCounts.low}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cobrança do mês */}
        <div className="px-5 mb-4">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Cobrança do Mês</h3>
              <button onClick={() => setPTab('financas')} className="text-[#E8580A] text-xs font-semibold">Ver análise</button>
            </div>
            <div className="flex items-center gap-5">
              {/* Ring MOVO style */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="3"
                    strokeLinecap="round" strokeDasharray={`${(pagoPct / 100) * 97.4} 97.4`}
                    style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-white">{pagoPct}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 font-medium">Recebido</span>
                  <span className="text-sm font-bold text-emerald-400">R$ {recebido.toFixed(0)}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 font-medium">Pendente</span>
                  <span className="text-sm font-bold text-white/50">R$ {pendente.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {alertStudents.length > 0 && (
          <div className="px-5 mb-4">
            <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Atenção Necessária</h3>
                <Pill color="amber">{alertStudents.length}</Pill>
              </div>
              <div className="space-y-2">
                {alertStudents.slice(0, 3).map(s => (
                  <button key={s.id} onClick={() => { setStudentDetail(s); setMode('detail'); setPTab('clientes'); }}
                    className="w-full flex items-center gap-3 p-3 bg-[#0A0A0A] border border-white/6 rounded-xl hover:border-white/15 transition-all text-left group">
                    <Avatar src={s.avatar} name={s.name} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] text-white/85 group-hover:text-white transition-colors truncate">{s.name}</p>
                      <p className="text-[10px] text-white/30 font-medium mt-0.5">
                        {s.paymentStatus === 'atrasado' ? 'Pagamento atrasado' : `Engajamento: ${s.engagementScore}%`}
                      </p>
                    </div>
                    <Pill color={s.paymentStatus === 'atrasado' ? 'red' : 'amber'}>
                      {s.paymentStatus === 'atrasado' ? 'Atrasado' : 'Risco'}
                    </Pill>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── CLIENTES ── */
  const PClientes = () => {
    const [q, setQ] = useState('');
    const filtered = students.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));

    return (
      <div className="pb-28 overflow-y-auto">
        {mode === 'list' && (
          <>
            <div className="px-5 pt-6 pb-4 flex items-center justify-between">
              <h1 className="text-2xl font-black">Clientes</h1>
              <button onClick={() => { setStudentDetail(null); setMode('new'); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#E8580A] text-white text-xs font-bold shadow-[0_4px_16px_rgba(232,88,10,0.4)] hover:bg-[#d44f08] active:scale-[0.97] transition-all">
                <Plus size={14} /> Novo
              </button>
            </div>

            <div className="px-5 mb-4">
              <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar clientes..."
                  className="w-full bg-[#111] border border-white/8 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#E8580A]/40 transition-colors" />
              </div>
            </div>
          </>
        )}

        {/* Grid MOVO style */}
        {mode === 'list' && (
          <div className="px-5 grid grid-cols-2 gap-3">
            {filtered.map((s, i) => (
              <motion.button key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => { setStudentDetail(s); setMode('detail'); }}
                className="text-left bg-[#111] border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all active:scale-[0.97]">

                <div className="mb-3 flex items-start justify-between">
                  <Avatar src={s.avatar} name={s.name} size={56} ring />
                  <div className={cx('w-2 h-2 rounded-full mt-1', s.status === 'active' ? 'bg-emerald-500' : 'bg-white/15')} />
                </div>

                <p className="font-bold text-[13px] leading-tight truncate text-white/90 mb-0.5">{s.name}</p>
                <p className="text-[#E8580A] text-[10px] font-medium opacity-80 truncate mb-3">{s.goal}</p>

                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-medium text-white/25">Performance</span>
                    <span className={cx('text-[9px] font-semibold',
                      s.engagementScore >= 70 ? 'text-emerald-400' : s.engagementScore >= 40 ? 'text-amber-400' : 'text-red-400')}>
                      {s.engagementScore}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={cx('h-full rounded-full transition-all duration-700',
                      s.engagementScore >= 70 ? 'bg-emerald-500' : s.engagementScore >= 40 ? 'bg-amber-500' : 'bg-red-500')}
                      style={{ width: `${s.engagementScore}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                  <span className="text-[10px] font-medium text-white/30">
                    {s.weekPlan ? `${Object.values(s.weekPlan).filter(Boolean).length}×/sem` : '—'}
                  </span>
                  <Pill color={s.paymentStatus === 'pago' ? 'emerald' : 'red'}>
                    {s.paymentStatus === 'pago' ? 'Pago' : 'Pend.'}
                  </Pill>
                </div>
              </motion.button>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/8 flex items-center justify-center mb-4">
                  <Users size={28} className="text-white/15" />
                </div>
                <p className="text-white/35 text-sm font-medium">Nenhum cliente encontrado</p>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {(mode === 'new' || mode === 'editProfile') && (
            <CadastroCliente student={mode === 'editProfile' ? studentDetail : null}
              onSave={(s) => { if (mode === 'new') { setStudents(ss => [...ss, s]); setStudentDetail(s); } else { updateStudent(s); setStudentDetail(s); } setMode('detail'); }}
              onClose={() => setMode(studentDetail ? 'detail' : 'list')} />
          )}
          {mode === 'detail' && studentDetail && (
            <DetalheCliente
              student={getStudentLive(studentDetail.id) || studentDetail}
              onEdit={() => setMode('editProfile')}
              onNewWorkout={() => setMode('newWorkout')}
              onWeekPlan={() => setMode('weekPlan')}
              onClose={() => { setMode('list'); setStudentDetail(null); }}
              onUpdateStudent={updateStudent} />
          )}
          {mode === 'newWorkout' && studentDetail && (
            <CriarTreino student={getStudentLive(studentDetail.id) || studentDetail}
              onSave={(workout) => {
                const s = getStudentLive(studentDetail.id) || studentDetail;
                const updated = { ...s, workouts: [...s.workouts, workout] };
                updateStudent(updated); setStudentDetail(updated); setMode('detail');
              }}
              onClose={() => setMode('detail')} />
          )}
          {mode === 'weekPlan' && studentDetail && (
            <EditorPlanoSemanal student={getStudentLive(studentDetail.id) || studentDetail}
              onSave={(plan) => {
                const s = getStudentLive(studentDetail.id) || studentDetail;
                const updated = { ...s, weekPlan: plan };
                updateStudent(updated); setStudentDetail(updated); setMode('detail');
              }}
              onClose={() => setMode('detail')} />
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* ── CADASTRO CLIENTE — Quiz MOVO style ── */
  const CadastroCliente = ({ student, onSave, onClose }: { student: Student | null; onSave: (s: Student) => void; onClose: () => void }) => {
    const isEdit = !!student;
    const [step, setStep] = useState(isEdit ? 99 : 0);
    const [form, setForm] = useState({
      name: student?.name || '',
      whatsapp: student?.whatsapp || '',
      age: student?.age?.toString() || '',
      goal: student?.goal || '',
      level: '',
      gym: student?.gym || '',
      email: student?.email || '',
      monthlyFee: student?.monthlyFee?.toString() || '250',
      paymentDueDay: student?.paymentDueDay?.toString() || '10',
      notes: student?.notes || '',
      goalWeight: student?.goalWeight?.toString() || '',
    });
    const [err, setErr] = useState('');

    const goals = [
      { label: 'Hipertrofia', sub: 'Ganho de massa muscular' },
      { label: 'Emagrecimento', sub: 'Perda de gordura e definição' },
      { label: 'Condicionamento', sub: 'Resistência cardiovascular' },
      { label: 'Força e Potência', sub: 'Treino de força máxima' },
      { label: 'Saúde e Bem-estar', sub: 'Qualidade de vida' },
      { label: 'Reabilitação', sub: 'Recuperação e prevenção' },
    ];
    const levels = [
      { label: 'Iniciante', sub: 'Menos de 1 ano treinando' },
      { label: 'Intermediário', sub: 'De 1 a 3 anos' },
      { label: 'Avançado', sub: 'Mais de 3 anos' },
    ];

    const steps = [
      { id: 'name', title: 'Qual o nome do aluno?', subtitle: 'Dados de identificação' },
      { id: 'goal', title: 'Qual o objetivo principal?', subtitle: 'Isso guia a montagem dos treinos' },
      { id: 'level', title: 'Qual o nível de experiência?', subtitle: 'Para calibrar a intensidade' },
      { id: 'details', title: 'Informações complementares', subtitle: 'Dados de contato e plano' },
    ];

    const save = () => {
      if (!form.name.trim()) { setErr('Nome é obrigatório.'); return; }
      if (!form.whatsapp.trim()) { setErr('WhatsApp é obrigatório.'); return; }
      const today = new Date().toISOString().split('T')[0];
      const s: Student = {
        ...(student || {}), id: student?.id || Date.now().toString(),
        name: form.name, age: parseInt(form.age) || undefined, gym: form.gym,
        email: form.email, whatsapp: form.whatsapp.replace(/\D/g, '') || '5511999999999',
        goal: form.goal || 'Hipertrofia', goalWeight: parseFloat(form.goalWeight) || undefined,
        status: student?.status || 'active', engagementScore: student?.engagementScore ?? 100,
        lastWorkoutDate: student?.lastWorkoutDate || today, streak: student?.streak ?? 0,
        monthlyFee: parseFloat(form.monthlyFee) || 250, paymentDueDay: parseInt(form.paymentDueDay) || 10,
        paymentStatus: student?.paymentStatus || 'pendente', paymentHistory: student?.paymentHistory || [],
        workouts: student?.workouts || [], weekPlan: student?.weekPlan || {},
        weightHistory: student?.weightHistory || [], measurements: student?.measurements || [],
        level: student?.level ?? 1, xp: student?.xp ?? 0,
        workoutFeedback: student?.workoutFeedback || [], notes: form.notes,
      };
      onSave(s);
    };

    const canAdvance = () => {
      if (step === 0) return form.name.trim().length > 0 && form.whatsapp.trim().length > 0;
      if (step === 1) return form.goal.length > 0;
      if (step === 2) return form.level.length > 0;
      return true;
    };

    // Edit mode: show full form
    if (isEdit || step === 99) return (
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-0 z-50 bg-[#0A0A0A] app-container overflow-y-auto">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/6 sticky top-0 bg-[#0A0A0A] z-10">
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40"><ArrowLeft size={18} /></button>
          <div className="text-center">
            <p className="font-bold text-base">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</p>
            <p className="text-[11px] text-white/35 mt-0.5">{isEdit ? student.name : 'Preencha os dados'}</p>
          </div>
          <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E8580A] text-white text-xs font-bold shadow-[0_4px_14px_rgba(232,88,10,0.35)]"><Save size={13} /> Salvar</button>
        </div>
        <div className="px-5 py-5 space-y-5">
          {err && <p className="text-red-400 text-sm flex items-center gap-2 bg-red-500/8 border border-red-500/15 rounded-xl p-3"><AlertTriangle size={14} />{err}</p>}
          <Inp label="Nome Completo" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Ex: João Silva" required />
          <Inp label="WhatsApp" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} placeholder="11 99999-0000" type="tel" required />
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Idade" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} placeholder="28" type="number" />
            <Inp label="Mensalidade (R$)" value={form.monthlyFee} onChange={v => setForm(f => ({ ...f, monthlyFee: v }))} placeholder="250" type="number" />
          </div>
          <Inp label="Academia" value={form.gym} onChange={v => setForm(f => ({ ...f, gym: v }))} placeholder="Nome da academia" />
          <Inp label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="email@exemplo.com" type="email" />
          <div>
            <label className="text-xs text-white/40 font-medium block mb-2">Objetivo</label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map(g => (
                <button key={g.label} onClick={() => setForm(f => ({ ...f, goal: g.label }))}
                  className={cx('p-3 rounded-xl border text-left text-sm font-semibold transition-all',
                    form.goal === g.label ? 'bg-[#E8580A]/10 border-[#E8580A]/40 text-white' : 'bg-[#111] border-white/8 text-white/50 hover:border-white/20')}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <Inp label="Observações" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Lesões, preferências..." textarea />
        </div>
      </motion.div>
    );

    // Quiz flow
    return (
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-0 z-50 bg-[#0A0A0A] app-container flex flex-col">

        {/* Header com progresso */}
        <div className="px-5 pt-6 pb-4 flex items-center gap-4">
          <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={cx('h-1 flex-1 rounded-full transition-all', i <= step ? 'bg-[#E8580A]' : 'bg-white/10')} />
            ))}
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            <p className="text-[11px] text-[#E8580A] font-bold uppercase tracking-widest mb-2">Passo {step + 1} de {steps.length}</p>
            <h2 className="text-2xl font-black text-white mb-1">{steps[step].title}</h2>
            <p className="text-white/40 text-sm mb-8">{steps[step].subtitle}</p>

            {/* Step 0: nome + telefone */}
            {step === 0 && (
              <div className="space-y-4">
                <Inp label="Nome Completo" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Ex: João Silva" required />
                <Inp label="WhatsApp" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} placeholder="11 99999-0000" type="tel" required />
              </div>
            )}

            {/* Step 1: objetivo */}
            {step === 1 && (
              <div className="space-y-3">
                {goals.map(g => (
                  <QuizOption key={g.label} label={g.label} sub={g.sub}
                    selected={form.goal === g.label} onSelect={() => setForm(f => ({ ...f, goal: g.label }))} />
                ))}
              </div>
            )}

            {/* Step 2: nível */}
            {step === 2 && (
              <div className="space-y-3">
                {levels.map(l => (
                  <QuizOption key={l.label} label={l.label} sub={l.sub}
                    selected={form.level === l.label} onSelect={() => setForm(f => ({ ...f, level: l.label }))} />
                ))}
              </div>
            )}

            {/* Step 3: detalhes */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Inp label="Mensalidade (R$)" value={form.monthlyFee} onChange={v => setForm(f => ({ ...f, monthlyFee: v }))} placeholder="250" type="number" />
                  <Inp label="Vencimento (dia)" value={form.paymentDueDay} onChange={v => setForm(f => ({ ...f, paymentDueDay: v }))} placeholder="10" type="number" />
                </div>
                <Inp label="Academia" value={form.gym} onChange={v => setForm(f => ({ ...f, gym: v }))} placeholder="Nome da academia" />
                <Inp label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="email@exemplo.com" type="email" />
                <Inp label="Observações" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Lesões, preferências..." textarea />
                {err && <p className="text-red-400 text-xs flex items-center gap-1.5"><AlertTriangle size={11} />{err}</p>}
              </div>
            )}
          </motion.div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-8 pt-3 border-t border-white/6">
          {step < steps.length - 1 ? (
            <button onClick={() => { if (canAdvance()) setStep(s => s + 1); }}
              disabled={!canAdvance()}
              className="w-full py-4 rounded-full bg-[#E8580A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(232,88,10,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]">
              Próximo <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={save}
              className="w-full py-4 rounded-full bg-[#E8580A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(232,88,10,0.4)] active:scale-[0.97] transition-all">
              <Check size={16} /> Cadastrar Aluno
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  /* ── DETALHE CLIENTE ── */
  const DetalheCliente = ({ student: s, onEdit, onNewWorkout, onWeekPlan, onClose, onUpdateStudent }:
    { student: Student; onEdit: () => void; onNewWorkout: () => void; onWeekPlan: () => void; onClose: () => void; onUpdateStudent: (s: Student) => void }) => {
    const lastWeight = s.weightHistory?.slice(-1)[0]?.weight;
    const lastMeas = s.measurements?.slice(-1)[0];
    const markPaid = () => onUpdateStudent({ ...s, paymentStatus: 'pago', paymentHistory: [...s.paymentHistory, { date: new Date().toISOString().split('T')[0], amount: s.monthlyFee, status: 'pago' as const }] });

    return (
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-0 z-50 bg-[#0A0A0A] app-container overflow-y-auto">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-sm z-10 border-b border-white/6">
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40"><ArrowLeft size={18} /></button>
          <p className="font-bold text-base">Perfil do Aluno</p>
          <button onClick={onEdit} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40"><Edit3 size={16} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Bio card */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={s.avatar} name={s.name} size={64} ring />
              <div className="flex-1">
                <h2 className="text-xl font-black">{s.name}</h2>
                <p className="text-[#E8580A] text-xs font-semibold mt-0.5">{s.goal}</p>
                <div className="flex items-center gap-3 mt-1.5 text-white/30 text-[11px]">
                  {s.age && <span>{s.age} anos</span>}
                  {s.gym && <span className="flex items-center gap-1"><MapPin size={9} />{s.gym}</span>}
                </div>
              </div>
              <Pill color={engColor(s.engagementScore)}>{engLabel(s.engagementScore)}</Pill>
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[10px] text-white/35 font-medium">
                <span>Engajamento</span><span>{s.engagementScore}%</span>
              </div>
              <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.engagementScore}%`, background: s.engagementScore >= 70 ? '#10b981' : s.engagementScore >= 40 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[['Nível', s.level], ['XP', s.xp], ['Sequência', `${s.streak}d`]].map(([l, v]) => (
                <div key={l as string} className="bg-[#0A0A0A] rounded-xl p-2.5 text-center border border-white/5">
                  <p className="text-[9px] uppercase text-white/20 font-bold">{l}</p>
                  <p className="text-base font-black mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Medidas */}
          {(lastWeight || lastMeas) && (
            <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
              <SectionHeader title="Avaliação Física" action="Atualizar" onAction={onEdit} />
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Peso', value: lastWeight ? `${lastWeight}kg` : null },
                  { label: 'Meta', value: s.goalWeight ? `${s.goalWeight}kg` : null },
                  { label: 'Peitoral', value: lastMeas?.chest ? `${lastMeas.chest}cm` : null },
                  { label: 'Cintura', value: lastMeas?.waist ? `${lastMeas.waist}cm` : null },
                  { label: 'Quadril', value: lastMeas?.hip ? `${lastMeas.hip}cm` : null },
                  { label: 'Braço', value: lastMeas?.arm ? `${lastMeas.arm}cm` : null },
                ].filter(x => x.value).map(item => (
                  <div key={item.label} className="bg-[#0A0A0A] rounded-xl p-3 text-center border border-white/5">
                    <p className="text-[9px] uppercase tracking-widest text-white/25 font-bold">{item.label}</p>
                    <p className="text-sm font-black mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {s.notes && (
            <div className="bg-[#E8580A]/5 border border-[#E8580A]/15 rounded-2xl p-5">
              <p className="font-bold text-sm mb-2 flex items-center gap-2"><FileText size={13} className="text-[#E8580A]" /> Observações</p>
              <p className="text-white/55 text-sm leading-relaxed">{s.notes}</p>
            </div>
          )}

          {/* Plano Semanal */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <SectionHeader title="Plano Semanal" action="Editar" onAction={onWeekPlan} />
            <div className="space-y-1.5">
              {DAY_NAMES.map((day, di) => {
                const w = s.weekPlan?.[di] ? s.workouts.find(x => x.id === s.weekPlan![di]) : null;
                return (
                  <div key={di} className={cx('flex items-center justify-between py-2.5 px-3 rounded-xl',
                    w ? 'bg-[#E8580A]/6 border border-[#E8580A]/12' : 'bg-[#0A0A0A] border border-white/4')}>
                    <div className="flex items-center gap-2.5">
                      <div className={cx('w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black',
                        w ? 'bg-[#E8580A] text-white' : 'bg-white/5 text-white/20')}>{DAY_LETTER[di]}</div>
                      <span className={cx('text-sm font-semibold', w ? 'text-white' : 'text-white/30')}>{DAY_SHORT[di]}</span>
                    </div>
                    {w ? <span className="text-[11px] text-[#E8580A] font-semibold max-w-[160px] truncate">{w.name}</span> : <span className="text-[11px] text-white/20">Descanso</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Treinos */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <SectionHeader title={`Treinos (${s.workouts.length})`} action="+ Criar" onAction={onNewWorkout} />
            {s.workouts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-white/25 text-sm mb-3">Nenhum treino criado.</p>
                <button onClick={onNewWorkout} className="px-5 py-2.5 rounded-full bg-[#E8580A]/12 border border-[#E8580A]/20 text-[#E8580A] text-xs font-bold">+ Criar primeiro treino</button>
              </div>
            ) : (
              <div className="space-y-2">
                {s.workouts.map(w => (
                  <div key={w.id} className="bg-[#0A0A0A] border border-white/6 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm">{w.name}</p>
                      <Pill color="gray">{w.exercises.length} ex.</Pill>
                    </div>
                    {w.exercises.slice(0, 3).map((ex, ei) => (
                      <div key={ex.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-md bg-[#E8580A]/12 flex items-center justify-center text-[8px] font-bold text-[#E8580A]">{ei + 1}</span>
                          <span className="text-xs text-white/50">{ex.name}</span>
                        </div>
                        <span className="text-[10px] text-white/25">{ex.sets}×{ex.reps}</span>
                      </div>
                    ))}
                    {w.exercises.length > 3 && <p className="text-xs text-white/20 pl-6 mt-1">+{w.exercises.length - 3} exercícios</p>}
                    <button onClick={() => onUpdateStudent({ ...s, workouts: s.workouts.filter(x => x.id !== w.id) })}
                      className="mt-3 w-full py-2 rounded-xl bg-red-500/8 text-red-400/70 text-[10px] font-bold border border-red-500/12 hover:bg-red-500/15 transition-colors flex items-center justify-center gap-1">
                      <Trash2 size={10} /> Excluir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagamento */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <SectionHeader title="Pagamento" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#0A0A0A] rounded-xl p-3 border border-white/5">
                <p className="text-[9px] uppercase tracking-widest text-white/25 font-bold">Mensalidade</p>
                <p className="text-lg font-black mt-0.5">R$ {s.monthlyFee}</p>
              </div>
              <div className={cx('rounded-xl p-3 border', s.paymentStatus === 'pago' ? 'bg-emerald-500/8 border-emerald-500/15' : 'bg-red-500/8 border-red-500/15')}>
                <p className="text-[9px] uppercase tracking-widest text-white/25 font-bold">Status</p>
                <p className={cx('text-lg font-black mt-0.5', s.paymentStatus === 'pago' ? 'text-emerald-400' : 'text-red-400')}>
                  {s.paymentStatus === 'pago' ? 'Em dia' : s.paymentStatus === 'atrasado' ? 'Atrasado' : 'Pendente'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {s.paymentStatus !== 'pago' && <button onClick={markPaid} className="flex-1 py-3 rounded-full bg-emerald-500/12 text-emerald-400 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Marcar Pago</button>}
              <button onClick={() => window.open(`https://wa.me/${s.whatsapp}?text=Olá ${s.name}! Lembrete da mensalidade.`, '_blank')}
                className="flex-1 py-3 rounded-full bg-[#E8580A]/12 text-[#E8580A] text-xs font-bold border border-[#E8580A]/20 hover:bg-[#E8580A]/20 transition-colors flex items-center justify-center gap-1.5">
                <Phone size={12} /> Cobrar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ── TREINOS ── */
  const PTreinos = () => {
    const [showModal, setShowModal] = useState(false);
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

    return (
      <div className="pb-28 overflow-y-auto">
        <div className="px-5 pt-6 pb-5 flex items-center justify-between">
          <h1 className="text-2xl font-black">Treinos</h1>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#E8580A] text-white text-xs font-bold shadow-[0_4px_16px_rgba(232,88,10,0.4)] hover:bg-[#d44f08] active:scale-[0.97] transition-all">
            <Plus size={14} /> Novo
          </button>
        </div>

        {/* Lista MOVO style — horizontal card com thumbnail */}
        <div className="px-5 space-y-3">
          {students.filter(s => s.workouts.length > 0).map((s, si) => {
            const activeDays = s.weekPlan ? Object.values(s.weekPlan).filter(Boolean).length : 0;
            return (
              <motion.button key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.05 }}
                onClick={() => setViewingStudent(s)}
                className="w-full flex items-center gap-4 p-4 text-left bg-[#111] border border-white/8 rounded-2xl hover:border-white/15 transition-all active:scale-[0.98] group">
                <Avatar src={s.avatar} name={s.name} size={52} ring />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] text-white/90 group-hover:text-white transition-colors">{s.name}</p>
                  <p className="text-[10px] text-[#E8580A] font-medium mt-0.5 opacity-80">{s.goal}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Pill color="gray">{s.workouts.length} treino{s.workouts.length !== 1 ? 's' : ''}</Pill>
                    {activeDays > 0 && <Pill color="gray">{activeDays}×/sem</Pill>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
              </motion.button>
            );
          })}

          {students.every(s => s.workouts.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/8 flex items-center justify-center mb-4"><BookOpen size={26} className="text-white/20" /></div>
              <p className="text-white/30 text-sm font-medium">Nenhum treino criado ainda.</p>
              <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 rounded-full bg-[#E8580A]/12 border border-[#E8580A]/20 text-[#E8580A] text-xs font-medium">+ Criar primeiro treino</button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {viewingStudent && (
            <VisualizarTreinosAluno student={getStudentLive(viewingStudent.id) || viewingStudent} onClose={() => setViewingStudent(null)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showModal && (
            <ModalCriarTreino students={students}
              onSave={(studentId, workout) => {
                const s = students.find(st => st.id === studentId);
                if (s) updateStudent({ ...s, workouts: [...s.workouts, workout] });
                setShowModal(false);
              }}
              onClose={() => setShowModal(false)} />
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* ── VISUALIZAR TREINOS DO ALUNO ── */
  const VisualizarTreinosAluno = ({ student: s, onClose }: { student: Student; onClose: () => void }) => (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-[#0A0A0A] app-container overflow-y-auto">

      <div className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-sm z-10 border-b border-white/5">
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <Avatar src={s.avatar} name={s.name} size={32} />
          <div className="text-center">
            <p className="font-semibold text-[13px] text-white/90">Treinos de {s.name.split(' ')[0]}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{s.workouts.length} treino{s.workouts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Divisão Semanal MOVO style */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <SectionHeader title="Divisão Semanal" />
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_SHORT.map((d, i) => {
              const workout = s.weekPlan?.[i] ? s.workouts.find(w => w.id === s.weekPlan![i]) : null;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[9px] font-medium text-white/25 uppercase">{d}</span>
                  <div className={cx('w-full aspect-square rounded-2xl flex items-center justify-center border transition-all',
                    workout ? 'bg-[#E8580A]/15 border-[#E8580A]/40 text-[#E8580A]' : 'bg-white/4 border-white/5 text-white/10')}>
                    {workout ? <Dumbbell size={13} /> : <div className="w-1 h-1 rounded-full bg-white/10" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fichas de treino estilo MOVO Exercise Library */}
        <div className="space-y-3">
          <p className="text-xs text-white/30 font-medium">Fichas de Treino</p>
          {s.workouts.map((w) => {
            const assignedDays = s.weekPlan ? Object.entries(s.weekPlan).filter(([_, id]) => id === w.id).map(([d]) => DAY_SHORT[parseInt(d)]) : [];
            return (
              <div key={w.id} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
                {/* Header da ficha */}
                <div className="flex items-center justify-between p-4 border-b border-white/6">
                  <div>
                    <h3 className="font-bold text-[14px] text-white">{w.name}</h3>
                    <p className="text-[10px] text-white/35 font-medium mt-0.5">{w.exercises.length} exercícios {assignedDays.length > 0 ? `· ${assignedDays.join(', ')}` : ''}</p>
                  </div>
                  <Pill color={assignedDays.length > 0 ? 'orange' : 'gray'}>
                    {assignedDays.length > 0 ? `${assignedDays.length}×/sem` : 'Livre'}
                  </Pill>
                </div>
                {/* Lista de exercícios estilo MOVO */}
                <div>
                  {w.exercises.map((ex, ei) => (
                    <div key={ex.id} className={cx('flex items-center gap-3 px-4 py-3', ei < w.exercises.length - 1 ? 'border-b border-white/5' : '')}>
                      <div className="w-8 h-8 rounded-xl bg-[#E8580A]/10 flex items-center justify-center text-[11px] font-bold text-[#E8580A] shrink-0">{ei + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white/80 truncate">{ex.name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{ex.weight}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-bold text-white/60">{ex.sets}×{ex.reps}</p>
                        <p className="text-[10px] text-white/25 mt-0.5">{ex.rest}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  /* ── MODAL CRIAR TREINO — Quiz style ── */
  const ModalCriarTreino = ({ students: allStudents, onSave, onClose }: { students: Student[]; onSave: (sid: string, w: Workout) => void; onClose: () => void }) => {
    const [step, setStep] = useState<'search' | 'name' | 'build'>('search');
    const [selected, setSelected] = useState<Student | null>(null);
    const [search, setSearch] = useState('');
    const [wName, setWName] = useState('');
    const [exs, setExs] = useState<Exercise[]>([]);
    const [nex, setNex] = useState({ name: '', sets: '3', reps: '12', weight: '10kg', rest: '60s' });

    const searchResult = search.length >= 2 ? allStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) : allStudents;
    const addEx = () => { if (!nex.name) return; setExs(e => [...e, { ...nex, sets: parseInt(nex.sets) || 3, id: Date.now().toString() }]); setNex({ name: '', sets: '3', reps: '12', weight: '10kg', rest: '60s' }); };
    const save = () => { if (!selected || !wName || exs.length === 0) return; onSave(selected.id, { id: Date.now().toString(), name: wName, exercises: exs, date: new Date().toISOString().split('T')[0] }); };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end app-container">
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-full bg-[#0A0A0A] border-t border-white/8 rounded-t-3xl overflow-hidden" style={{ maxHeight: '92vh' }}>
          <div className="overflow-y-auto" style={{ maxHeight: '92vh' }}>

            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
              <div className="w-10 h-1 bg-white/15 rounded-full absolute left-1/2 -translate-x-1/2 top-3" />
              <button onClick={step !== 'search' ? () => setStep(s => s === 'build' ? 'name' : 'search') : onClose}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><ArrowLeft size={15} /></button>
              <p className="font-bold text-sm">
                {step === 'search' ? 'Selecionar Aluno' : step === 'name' ? 'Nome do Treino' : `Treino — ${selected?.name.split(' ')[0]}`}
              </p>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><X size={15} /></button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Step: buscar aluno */}
              {step === 'search' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..."
                      className="w-full bg-[#111] border border-white/8 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#E8580A]/40 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    {searchResult.map(s => (
                      <button key={s.id} onClick={() => { setSelected(s); setStep('name'); }}
                        className="w-full flex items-center gap-3 p-4 bg-[#111] border border-white/8 rounded-xl hover:border-[#E8580A]/30 transition-all text-left">
                        <Avatar src={s.avatar} name={s.name} size={40} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{s.name}</p>
                          <p className="text-white/35 text-xs">{s.goal} · {s.workouts.length} treinos</p>
                        </div>
                        <ChevronRight size={15} className="text-white/20" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: nome do treino */}
              {step === 'name' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[#E8580A]/8 border border-[#E8580A]/20 rounded-xl">
                    <Avatar src={selected?.avatar} name={selected?.name || ''} size={36} />
                    <p className="font-semibold text-sm">{selected?.name}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm mb-4">Como vai se chamar este treino?</p>
                    <input value={wName} onChange={e => setWName(e.target.value)} placeholder="Ex: Treino A – Peito e Tríceps"
                      className="w-full bg-[#111] border border-white/8 rounded-xl p-4 text-sm font-semibold focus:outline-none focus:border-[#E8580A]/40 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-white/35 font-medium mb-2">Sugestões rápidas</p>
                    <div className="flex flex-wrap gap-2">
                      {['Treino A – Peito', 'Treino B – Costas', 'Treino C – Pernas', 'Full Body', 'Cardio + Core'].map(n => (
                        <button key={n} onClick={() => setWName(n)} className="px-3 py-1.5 rounded-full bg-[#111] border border-white/8 text-xs font-medium text-white/50 hover:border-[#E8580A]/30 hover:text-white/70 transition-all">{n}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => wName && setStep('build')} disabled={!wName}
                    className="w-full py-4 rounded-full bg-[#E8580A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(232,88,10,0.4)] disabled:opacity-40 active:scale-[0.97] transition-all">
                    Próximo <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Step: montar treino */}
              {step === 'build' && (
                <div className="space-y-4">
                  <div className="bg-[#111] border border-white/8 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Adicionar Exercício</p>
                    <input placeholder="Nome do exercício *" value={nex.name} onChange={e => setNex(x => ({ ...x, name: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-white/8 rounded-xl p-3 text-sm focus:outline-none focus:border-[#E8580A]/40 transition-colors" />
                    <div className="grid grid-cols-4 gap-2">
                      {[['Séries', 'sets', '3'], ['Reps', 'reps', '12'], ['Carga', 'weight', '10kg'], ['Desc.', 'rest', '60s']].map(([ph, k, def]) => (
                        <div key={k}>
                          <label className="text-[9px] uppercase tracking-widest text-white/25 font-bold block mb-1">{ph}</label>
                          <input value={(nex as any)[k]} onChange={e => setNex(x => ({ ...x, [k]: e.target.value }))} placeholder={def}
                            className="w-full bg-[#0A0A0A] border border-white/8 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#E8580A]/40 transition-colors text-center" />
                        </div>
                      ))}
                    </div>
                    <button onClick={addEx} disabled={!nex.name}
                      className="w-full py-3 rounded-full bg-[#E8580A]/12 text-[#E8580A] text-xs font-bold border border-[#E8580A]/20 hover:bg-[#E8580A]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>

                  {exs.length > 0 && (
                    <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
                      {exs.map((ex, i) => (
                        <div key={ex.id} className={cx('flex items-center gap-3 px-4 py-3', i < exs.length - 1 ? 'border-b border-white/5' : '')}>
                          <div className="w-7 h-7 rounded-xl bg-[#E8580A]/10 flex items-center justify-center text-[10px] font-bold text-[#E8580A]">{i + 1}</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{ex.name}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">{ex.sets}×{ex.reps} · {ex.weight}</p>
                          </div>
                          <button onClick={() => setExs(e => e.filter(x => x.id !== ex.id))} className="w-7 h-7 rounded-lg bg-red-500/12 flex items-center justify-center text-red-400"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={save} disabled={exs.length === 0}
                    className="w-full py-4 rounded-full bg-[#E8580A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(232,88,10,0.4)] hover:bg-[#d44f08] transition-all disabled:opacity-40 active:scale-[0.97]">
                    <Save size={16} /> Salvar Treino ({exs.length} exercícios)
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  /* ── CRIAR TREINO (do detalhe do cliente) ── */
  const CriarTreino = ({ student, onSave, onClose }: { student: Student; onSave: (w: Workout) => void; onClose: () => void }) => {
    const [name, setName] = useState('');
    const [exs, setExs] = useState<Exercise[]>([]);
    const [nex, setNex] = useState({ name: '', sets: '3', reps: '12', weight: '10kg', rest: '60s' });
    const addEx = () => { if (!nex.name) return; setExs(e => [...e, { ...nex, sets: parseInt(nex.sets) || 3, id: Date.now().toString() }]); setNex({ name: '', sets: '3', reps: '12', weight: '10kg', rest: '60s' }); };
    const save = () => { if (!name || exs.length === 0) return; onSave({ id: Date.now().toString(), name, exercises: exs, date: new Date().toISOString().split('T')[0] }); };

    return (
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-0 z-50 bg-[#0A0A0A] app-container overflow-y-auto">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#0A0A0A] z-10 border-b border-white/6">
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40"><ArrowLeft size={18} /></button>
          <div className="text-center"><p className="font-bold text-base">Criar Treino</p><p className="text-[11px] text-white/35 mt-0.5">{student.name}</p></div>
          <button onClick={save} disabled={!name || exs.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E8580A] text-white text-xs font-bold disabled:opacity-40"><Save size={13} /> Salvar</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Inp label="Nome do Treino" value={name} onChange={setName} placeholder="Ex: Treino A – Peito" required />
          <div className="bg-[#111] border border-white/8 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Adicionar Exercício</p>
            <input placeholder="Nome do exercício *" value={nex.name} onChange={e => setNex(x => ({ ...x, name: e.target.value }))}
              className="w-full bg-[#0A0A0A] border border-white/8 rounded-xl p-3 text-sm focus:outline-none focus:border-[#E8580A]/40 transition-colors" />
            <div className="grid grid-cols-4 gap-2">
              {[['Séries', 'sets', '3'], ['Reps', 'reps', '12'], ['Carga', 'weight', '10kg'], ['Desc.', 'rest', '60s']].map(([ph, k, def]) => (
                <div key={k}>
                  <label className="text-[9px] uppercase tracking-widest text-white/25 font-bold block mb-1">{ph}</label>
                  <input value={(nex as any)[k]} onChange={e => setNex(x => ({ ...x, [k]: e.target.value }))} placeholder={def}
                    className="w-full bg-[#0A0A0A] border border-white/8 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#E8580A]/40 transition-colors text-center" />
                </div>
              ))}
            </div>
            <button onClick={addEx} disabled={!nex.name}
              className="w-full py-3 rounded-full bg-[#E8580A]/12 text-[#E8580A] text-xs font-bold border border-[#E8580A]/20 hover:bg-[#E8580A]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
              <Plus size={14} /> Adicionar
            </button>
          </div>
          {exs.length > 0 && (
            <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
              {exs.map((ex, i) => (
                <div key={ex.id} className={cx('flex items-center gap-3 px-4 py-3', i < exs.length - 1 ? 'border-b border-white/5' : '')}>
                  <div className="w-7 h-7 rounded-xl bg-[#E8580A]/10 flex items-center justify-center text-[10px] font-bold text-[#E8580A]">{i + 1}</div>
                  <div className="flex-1"><p className="text-sm font-semibold">{ex.name}</p><p className="text-[10px] text-white/30 mt-0.5">{ex.sets}×{ex.reps} · {ex.weight}</p></div>
                  <button onClick={() => setExs(e => e.filter(x => x.id !== ex.id))} className="w-7 h-7 rounded-lg bg-red-500/12 flex items-center justify-center text-red-400"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  /* ── EDITOR PLANO SEMANAL ── */
  const EditorPlanoSemanal = ({ student, onSave, onClose }: { student: Student; onSave: (p: WeekPlan) => void; onClose: () => void }) => {
    const [plan, setPlan] = useState<WeekPlan>(student.weekPlan || {});
    return (
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-0 z-50 bg-[#0A0A0A] app-container overflow-y-auto">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#0A0A0A] z-10 border-b border-white/6">
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40"><ArrowLeft size={18} /></button>
          <div className="text-center"><p className="font-bold text-base">Plano Semanal</p><p className="text-[11px] text-white/35 mt-0.5">{student.name}</p></div>
          <button onClick={() => onSave(plan)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E8580A] text-white text-xs font-bold"><Save size={13} /> Salvar</button>
        </div>
        <div className="px-5 py-5 space-y-3">
          {student.workouts.length === 0 && (
            <div className="p-4 rounded-2xl bg-[#E8580A]/6 border border-[#E8580A]/15 text-center">
              <p className="text-[#E8580A]/80 text-sm font-semibold">Crie treinos primeiro para montar o plano.</p>
            </div>
          )}
          {DAY_NAMES.map((day, di) => {
            const assigned = plan[di];
            const workout = assigned ? student.workouts.find(w => w.id === assigned) : null;
            return (
              <div key={di} className="bg-[#111] border border-white/8 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cx('w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black',
                    assigned ? 'bg-[#E8580A] text-white' : 'bg-white/5 text-white/25 border border-white/8')}>{DAY_LETTER[di]}</div>
                  <div>
                    <p className="font-bold text-sm">{day}</p>
                    <p className={cx('text-[11px] mt-0.5', workout ? 'text-[#E8580A] font-semibold' : 'text-white/25')}>{workout ? workout.name : 'Descanso'}</p>
                  </div>
                  {assigned && <button onClick={() => setPlan(p => ({ ...p, [di]: null }))} className="ml-auto w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400"><X size={12} /></button>}
                </div>
                {student.workouts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setPlan(p => ({ ...p, [di]: null }))}
                      className={cx('px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all', !assigned ? 'bg-white/10 text-white/70 border-white/20' : 'bg-white/3 text-white/25 border-white/6 hover:border-white/15')}>Descanso</button>
                    {student.workouts.map(w => (
                      <button key={w.id} onClick={() => setPlan(p => ({ ...p, [di]: w.id }))}
                        className={cx('px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all',
                          plan[di] === w.id ? 'bg-[#E8580A] text-white border-transparent' : 'bg-white/5 text-white/45 border-white/8 hover:border-[#E8580A]/35')}>
                        {w.name.length > 20 ? w.name.substring(0, 20) + '…' : w.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  /* ═══════════════════════ PAINEL ALUNO ═══════════════════════ */
  const student0 = loggedStudent ? (students.find(s => s.id === loggedStudent.id) || loggedStudent) : students[0];

  const AInicio = () => {
    const s = student0;
    if (!s) return null;
    const today = new Date(); const dow = today.getDay();
    const xpPct = (s.xp % 1000) / 10;
    const todayWorkout = s.weekPlan?.[dow] ? s.workouts.find(w => w.id === s.weekPlan![dow]) : null;
    const weekDisplay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - 3 + i);
      const dd = d.getDay(); const wId = s.weekPlan?.[dd];
      return { date: d.getDate(), dl: DAY_SHORT[dd], isToday: i === 3, isPast: i < 3, hasW: !!wId };
    });

    return (
      <div className="pb-28 overflow-y-auto">
        {/* Header MOVO style */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/35 font-medium mb-0.5">Bem-vindo de volta</p>
            <h1 className="text-3xl font-black tracking-tight">{s.name.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#111] border border-white/8">
              <Flame size={14} className="text-[#E8580A]" /><span className="text-sm font-bold">{s.streak}</span>
            </div>
            <Avatar src={s.avatar} name={s.name} size={38} />
          </div>
        </div>

        {/* XP bar */}
        <div className="px-5 mb-4">
          <div className="flex justify-between text-[11px] font-medium text-white/30 mb-1.5">
            <span>Nível {s.level}</span><span>{s.xp % 1000}/1000 XP</span>
          </div>
          <div className="h-1.5 bg-[#181818] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-[#E8580A] rounded-full" />
          </div>
        </div>

        {/* Calendário semanal MOVO */}
        <div className="px-5 mb-4">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
            <p className="text-xs text-white/35 font-medium mb-3 capitalize">
              {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDisplay.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] uppercase font-medium text-white/25">{d.dl}</span>
                  <div className={cx('w-full aspect-square rounded-xl flex items-center justify-center',
                    d.isToday ? 'bg-[#E8580A] shadow-[0_0_12px_rgba(232,88,10,0.5)]' :
                      d.isPast && d.hasW ? 'bg-emerald-500/20' :
                        d.hasW ? 'bg-[#181818] border border-[#E8580A]/20' :
                          'bg-[#181818] border border-white/5')}>
                    {d.isPast && d.hasW
                      ? <CheckCircle2 size={11} className="text-emerald-400" />
                      : <span className={cx('text-[10px] font-bold', d.isToday ? 'text-white' : 'text-white/35')}>{d.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress MOVO */}
        <div className="px-5 mb-4">
          <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
            <SectionHeader title="Progresso" />
            <div className="space-y-4">
              {[
                { icon: Activity, label: 'Tempo de exercício hoje', value: '20 min', color: 'text-[#E8580A]', bg: 'bg-[#E8580A]/15' },
                { icon: Target, label: 'Metas concluídas', value: '3/5', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
                { icon: Flame, label: 'Dias consecutivos', value: `${s.streak} dias`, color: 'text-amber-400', bg: 'bg-amber-500/15' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cx('w-8 h-8 rounded-xl flex items-center justify-center', item.bg)}>
                    <item.icon size={15} className={item.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/40 font-medium">{item.label}</p>
                    <p className="text-sm font-bold text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Goal / Treino de hoje */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Treino de Hoje</p>
            <button onClick={() => setATab('treinos')} className="text-[#E8580A] text-xs font-semibold">Ver Todos</button>
          </div>
          {todayWorkout ? (
            <div className="relative h-52 rounded-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop" alt="" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[11px] font-bold text-[#E8580A] mb-1">Sugerido para hoje</p>
                <p className="text-xl font-black mb-1">{todayWorkout.name}</p>
                <p className="text-white/40 text-xs mb-4">{todayWorkout.exercises.length} exercícios · ~45 min</p>
                <button onClick={() => { setActiveWorkout(todayWorkout); setATab('treino'); }}
                  className="w-full py-3.5 rounded-full bg-[#E8580A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(232,88,10,0.4)]">
                  <Play size={15} fill="white" /> Iniciar Treino
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/8 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3"><Calendar size={20} className="text-white/20" /></div>
              <p className="font-bold text-white/50 text-sm">Dia de Descanso</p>
              <p className="text-white/25 text-xs mt-1">Aproveite para recuperar!</p>
              <button onClick={() => setATab('treinos')} className="mt-4 px-5 py-2.5 rounded-full bg-[#E8580A]/12 border border-[#E8580A]/20 text-[#E8580A] text-xs font-bold">Ver outros treinos</button>
            </div>
          )}
        </div>

        {/* AI Recomendação MOVO */}
        <div className="px-5">
          <button onClick={() => setShowAI(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#111] border border-[#E8580A]/20 hover:border-[#E8580A]/35 transition-colors active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl bg-[#E8580A]/15 flex items-center justify-center shrink-0"><Sparkles size={18} className="text-[#E8580A]" /></div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm">AI Recommendation</p>
              <p className="text-white/35 text-xs mt-0.5">Descreva seus objetivos — IA monta seu plano</p>
            </div>
            <ChevronRight size={16} className="text-white/20" />
          </button>
        </div>
      </div>
    );
  };

  /* ── MODO TREINO ── */
  const ModoTreino = () => {
    if (!activeWorkout) return null;
    if (wDone) return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 app-container bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15, damping: 14 }}
          className="w-20 h-20 rounded-full bg-[#E8580A] flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(232,88,10,0.6)]">
          <CheckCircle2 size={40} className="text-white" />
        </motion.div>
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
          <h2 className="text-3xl font-black mb-1.5">Treino Concluído!</h2>
          <p className="text-white/40 text-sm">Excelente trabalho! Continue assim.</p>
        </motion.div>
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="w-full bg-[#111] border border-white/8 rounded-2xl p-5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Resumo</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[['Duração', '~45 min'], ['Exercícios', `${activeWorkout.exercises.length}`], ['Calorias', '~350 kcal'], ['XP Ganho', '+100 XP']].map(([l, v]) => (
              <div key={l}><p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{l}</p><p className="text-xl font-black mt-0.5">{v}</p></div>
            ))}
          </div>
        </motion.div>
        <motion.button initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          onClick={() => { setWDone(false); setActiveWorkout(null); setExIdx(0); setATab('inicio'); }}
          className="w-full py-4 rounded-full bg-[#E8580A] text-white font-bold shadow-[0_4px_24px_rgba(232,88,10,0.45)]">
          Voltar ao Início
        </motion.button>
      </motion.div>
    );

    const ex = activeWorkout.exercises[exIdx];
    const progress = (exIdx / activeWorkout.exercises.length) * 100;

    return (
      <div className="flex flex-col min-h-screen pb-8">
        <div className="px-5 pt-6 pb-3 flex items-center justify-between">
          <button onClick={() => { setActiveWorkout(null); setExIdx(0); setATab('inicio'); }} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40"><ArrowLeft size={18} /></button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#E8580A] font-bold mb-0.5">Treinando Agora</p>
            <p className="font-bold text-base">{activeWorkout.name}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#111] border border-white/8 flex items-center justify-center text-xs font-bold text-white/40">{exIdx + 1}/{activeWorkout.exercises.length}</div>
        </div>

        {/* Progress bar */}
        <div className="px-5 mb-4"><div className="h-1.5 bg-[#181818] rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-[#E8580A] rounded-full" /></div></div>

        {/* Exercise image */}
        <div className="px-5 mb-4">
          <div className="relative rounded-2xl overflow-hidden aspect-video">
            <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop" alt="" className="w-full h-full object-cover opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#E8580A]/20 border border-[#E8580A]/45 flex items-center justify-center"><Play size={26} fill="#E8580A" className="ml-1" /></div>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-4">
          <div className="text-center">
            <h3 className="text-3xl font-black mb-3">{ex.name}</h3>
            <div className="flex justify-center gap-2">
              <Pill color="orange">{ex.sets} séries</Pill>
              <Pill color="gray">{ex.reps} reps</Pill>
              <Pill color="gray">{ex.weight}</Pill>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111] border border-[#E8580A]/20 rounded-2xl p-5 flex flex-col items-center gap-1">
              <p className="text-[10px] uppercase tracking-widest text-[#E8580A]/70 font-bold">Descanso</p>
              <p className="text-3xl font-black text-[#E8580A]">{timer > 0 ? `${timer}s` : ex.rest}</p>
            </div>
            <div className="bg-[#111] border border-white/8 rounded-2xl p-5 flex flex-col items-center gap-1">
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Carga</p>
              <p className="text-3xl font-black">{ex.weight}</p>
            </div>
          </div>

          <button onClick={nextEx} className="w-full py-4 rounded-full bg-[#E8580A] text-white font-bold text-base shadow-[0_4px_20px_rgba(232,88,10,0.4)] hover:bg-[#d44f08] active:scale-[0.97] transition-all">
            {exIdx === activeWorkout.exercises.length - 1 ? 'Finalizar Treino ✓' : 'Próximo Exercício →'}
          </button>

          {/* Exercise list */}
          <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
            {activeWorkout.exercises.map((e, i) => (
              <div key={e.id} className={cx('flex items-center gap-3 px-4 py-3', i < activeWorkout.exercises.length - 1 ? 'border-b border-white/5' : '', i === exIdx ? 'bg-[#E8580A]/8' : '')}>
                <div className={cx('w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold',
                  i < exIdx ? 'bg-emerald-500/15 text-emerald-400' : i === exIdx ? 'bg-[#E8580A] text-white' : 'bg-white/5 text-white/25')}>
                  {i < exIdx ? '✓' : i + 1}
                </div>
                <span className={cx('text-sm font-semibold flex-1', i === exIdx ? 'text-white' : i < exIdx ? 'text-white/30 line-through' : 'text-white/50')}>{e.name}</span>
                <span className="text-[10px] font-bold text-white/25">{e.sets}×{e.reps}</span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {timerOn && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0A0A0A]/97 flex flex-col items-center justify-center p-6 text-center app-container">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#E8580A] font-bold mb-10">Tempo de Descanso</p>
              <div className="relative w-52 h-52 mb-10">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#E8580A" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(timer / (parseInt(ex.rest) || 60)) * 289} 289`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-7xl font-black leading-none">{timer}</span><span className="text-sm font-medium text-white/35 mt-1">seg</span></div>
              </div>
              <button onClick={() => setTimerOn(false)} className="w-full max-w-[260px] py-4 rounded-full border border-white/10 text-white/50 font-bold text-sm hover:bg-white/5 transition-colors">Pular Descanso</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* ── AI BUILDER ── */
  const AIBuilder = () => {
    const chips = ['Força', 'Cardio', 'Sem Equipamento', 'Pernas e Core', 'Parte Superior', 'Perda de Gordura'];
    return (
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-0 z-50 app-container bg-[#0A0A0A] flex flex-col">
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/6">
          <button onClick={() => setShowAI(false)} className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/40"><ArrowLeft size={18} /></button>
          <div className="text-center"><p className="font-bold text-base">AI Workout Builder</p><p className="text-[11px] text-white/35 mt-0.5">Descreva seus objetivos</p></div>
          <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="relative">
            <textarea value={aiText} onChange={e => setAiText(e.target.value)} maxLength={500} rows={6} placeholder="Quero um programa 3x por semana, máximo 45 min..."
              className="w-full bg-[#111] border border-white/8 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E8580A]/40 transition-colors resize-none leading-relaxed" />
            <span className="absolute bottom-4 right-4 text-[10px] font-bold text-white/25">{aiText.length}/500</span>
          </div>
          <div>
            <p className="text-xs text-white/30 font-medium mb-3">Sugestões Rápidas</p>
            <div className="flex flex-wrap gap-2">{chips.map(c => <button key={c} onClick={() => setAiText(t => t ? `${t}, ${c}` : c)} className="px-3.5 py-1.5 rounded-full bg-[#111] border border-white/8 text-xs font-medium text-white/50 hover:border-[#E8580A]/35 hover:text-white/80 transition-all">{c}</button>)}</div>
          </div>
          <AnimatePresence>{aiResult && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-[#E8580A]/8 border border-[#E8580A]/20"><p className="text-[10px] uppercase tracking-widest text-[#E8580A] font-bold mb-2.5">Seu Plano AI</p><p className="text-sm text-white/75 leading-relaxed">{aiResult}</p></motion.div>)}</AnimatePresence>
        </div>
        <div className="px-5 py-5 border-t border-white/6">
          <button disabled={!aiText.trim() || aiLoad}
            onClick={async () => {
              setAiLoad(true);
              try {
                const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: `Você é personal trainer. Crie plano de treino conciso (máx 150 palavras, prático e motivador): "${aiText}"` }] }) });
                const d = await r.json(); setAiResult(d.content?.[0]?.text || 'Erro ao gerar.');
              } catch { setAiResult('Erro ao gerar. Tente novamente.'); }
              setAiLoad(false);
            }}
            className="w-full py-4 rounded-full bg-[#E8580A] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(232,88,10,0.4)] hover:bg-[#d44f08] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]">
            {aiLoad ? <><div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" /> Gerando...</> : <><Sparkles size={16} /> Gerar Plano</>}
          </button>
        </div>
      </motion.div>
    );
  };

  /* ══ NAVBAR ══ */
  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center transition-all active:scale-95">
      <div className={cx('flex items-center gap-2 px-4 py-2 rounded-full transition-all',
        active ? 'bg-[#E8580A] text-white' : 'text-white/30 hover:text-white/60')}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        {active && <span className="text-xs font-bold">{label}</span>}
      </div>
    </button>
  );

  /* ══ LAYOUTS ══ */
  if (view === 'personal') return (
    <div className="app-container bg-[#0A0A0A]">
      {pTab === 'inicio' && <PInicio />}
      {pTab === 'clientes' && <PClientes />}
      {pTab === 'treinos' && <PTreinos />}
      {pTab === 'financas' && <PersonalFinance students={students} />}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/6 px-6 py-3 flex justify-between items-center z-40 pb-safe">
        <NavItem icon={Home} label="Início" active={pTab === 'inicio'} onClick={() => { setMode('list'); setPTab('inicio'); }} />
        <NavItem icon={Users} label="Clientes" active={pTab === 'clientes'} onClick={() => { setMode('list'); setPTab('clientes'); }} />
        <NavItem icon={Dumbbell} label="Treinos" active={pTab === 'treinos'} onClick={() => setPTab('treinos')} />
        <NavItem icon={TrendingUp} label="Finanças" active={pTab === 'financas'} onClick={() => setPTab('financas')} />
      </nav>
    </div>
  );

  if (view === 'aluno') return (
    <div className="app-container bg-[#0A0A0A]">
      {!activeWorkout && aTab === 'inicio' && <AInicio />}
      {!activeWorkout && aTab === 'treinos' && <AlunoWorkouts student={student0} onStartWorkout={w => { setActiveWorkout(w); setATab('treino'); }} />}
      {!activeWorkout && aTab === 'evolucao' && <AlunoEvolution student={student0} />}
      {!activeWorkout && aTab === 'perfil' && <AlunoProfile student={student0} />}
      {activeWorkout && <ModoTreino />}
      <AnimatePresence>{showAI && <AIBuilder />}</AnimatePresence>
      {!activeWorkout && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/6 px-6 py-3 flex justify-between items-center z-40 pb-safe">
          <NavItem icon={Home} label="Início" active={aTab === 'inicio'} onClick={() => setATab('inicio')} />
          <NavItem icon={Dumbbell} label="Treinos" active={aTab === 'treinos'} onClick={() => setATab('treinos')} />
          <NavItem icon={TrendingUp} label="Stats" active={aTab === 'evolucao'} onClick={() => setATab('evolucao')} />
          <NavItem icon={User} label="Perfil" active={aTab === 'perfil'} onClick={() => setATab('perfil')} />
        </nav>
      )}
    </div>
  );

  return null;
}