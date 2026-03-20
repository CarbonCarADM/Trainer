import React from 'react';
import { Student } from '../types';
import { Mail, Target, Phone, Settings, LogOut, ChevronRight, Shield, Bell, Zap, Trophy, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const AlunoProfile = ({ student }: { student: Student }) => {
  if (!student) return null;
  const xpPct = (student.xp % 1000) / 10;

  return (
    <div className="pb-28 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <h1 className="text-2xl font-black">Perfil</h1>
        <button className="w-10 h-10 rounded-xl bg-[#111] border border-white/8 flex items-center justify-center text-white/35 hover:text-white/60 transition-colors">
          <Settings size={18} />
        </button>
      </div>

      {/* Profile card MOVO style */}
      <div className="px-5 mb-4">
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-[#E8580A]/20 border-2 border-[#E8580A]/30 flex items-center justify-center overflow-hidden">
                {student.avatar
                  ? <img src={student.avatar} alt="Perfil" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-black text-[#E8580A]">{student.name[0]}</span>}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-[#E8580A] flex items-center justify-center shadow-[0_2px_10px_rgba(232,88,10,0.5)]">
                <Star size={12} fill="white" className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black leading-tight">{student.name}</h2>
              <p className="text-[#E8580A] text-xs font-semibold mt-0.5">Nível {student.level} · Atleta</p>
              {student.gym && (
                <p className="text-white/25 text-xs flex items-center gap-1 mt-1">
                  <MapPin size={10} />{student.gym}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-white/40 text-[10px] font-medium">
                  <Zap size={10} className="text-[#E8580A]" /><span>{student.xp} XP</span>
                </div>
                <span className="text-white/15">·</span>
                <div className="flex items-center gap-1 text-white/40 text-[10px] font-medium">
                  <Trophy size={10} className="text-amber-400" /><span>{student.streak} dias seguidos</span>
                </div>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div>
            <div className="flex justify-between text-[10px] font-medium text-white/30 mb-1.5">
              <span>Progresso para Nível {student.level + 1}</span>
              <span>{student.xp % 1000}/1000 XP</span>
            </div>
            <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-[#E8580A] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Dados da conta */}
      <div className="px-5 mb-4">
        <p className="text-xs font-medium text-white/30 mb-3">Dados da Conta</p>
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          {[
            { icon: Mail, label: 'E-mail', value: student.email || 'Não informado' },
            { icon: Phone, label: 'Telefone', value: student.whatsapp },
            { icon: Target, label: 'Objetivo', value: student.goal },
          ].map((item, i, arr) => (
            <div key={item.label} className={cx(
              'flex items-center justify-between p-4 hover:bg-white/3 transition-colors cursor-pointer',
              i < arr.length - 1 ? 'border-b border-white/5' : ''
            )}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] border border-white/6 flex items-center justify-center text-white/35">
                  <item.icon size={15} />
                </div>
                <div>
                  <p className="text-[10px] text-white/25 font-medium">{item.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-white/15" />
            </div>
          ))}
        </div>
      </div>

      {/* Preferências */}
      <div className="px-5 mb-4">
        <p className="text-xs font-medium text-white/30 mb-3">Preferências</p>
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          {[
            { icon: Bell, label: 'Notificações' },
            { icon: Shield, label: 'Privacidade e Segurança' },
          ].map((item, i, arr) => (
            <div key={item.label} className={cx(
              'flex items-center justify-between p-4 hover:bg-white/3 transition-colors cursor-pointer',
              i < arr.length - 1 ? 'border-b border-white/5' : ''
            )}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] border border-white/6 flex items-center justify-center text-white/35">
                  <item.icon size={15} />
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              <ChevronRight size={15} className="text-white/15" />
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-5">
        <button className="w-full py-4 rounded-full border border-red-500/20 text-red-400/70 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500/6 transition-colors active:scale-[0.97]">
          <LogOut size={15} /> Sair
        </button>
      </div>
    </div>
  );
};