import React from 'react';
import { Student, Workout } from '../types';
import { Play, Clock, Flame, Dumbbell, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const imgs = [
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
];

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const AlunoWorkouts = ({ student, onStartWorkout }: { student: Student; onStartWorkout?: (w: Workout) => void }) => {
  if (!student) return null;

  return (
    <div className="pb-28 overflow-y-auto">
      <div className="px-5 pt-6 pb-5">
        <h1 className="text-2xl font-black">Treinos</h1>
        <p className="text-white/35 text-sm mt-0.5">Seus programas de treino</p>
      </div>

      <div className="px-5 space-y-4">
        {(student.workouts || []).map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">

              {/* Thumbnail hero */}
              <div className="relative h-44 overflow-hidden">
                <img src={imgs[i % imgs.length]} alt="" className="w-full h-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Dumbbell size={11} className="text-white/50" />
                    <span className="text-[10px] font-medium text-white/50">{w.exercises.length} exercícios</span>
                  </div>
                  {i === 0 && (
                    <span className="bg-[#E8580A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Atual</span>
                  )}
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-black text-lg leading-tight mb-1">{w.name}</h3>
                  <div className="flex items-center gap-4 text-white/40 text-xs font-medium">
                    <div className="flex items-center gap-1"><Clock size={11} /><span>~45 min</span></div>
                    <div className="flex items-center gap-1"><Flame size={11} /><span>~350 kcal</span></div>
                  </div>
                </div>
              </div>

              {/* Exercise list — MOVO style */}
              <div className="border-t border-white/6">
                {w.exercises.slice(0, 4).map((ex, ei) => (
                  <div key={ex.id} className={cx('flex items-center gap-3 px-4 py-3', ei < Math.min(w.exercises.length, 4) - 1 ? 'border-b border-white/5' : '')}>
                    <div className="w-8 h-8 rounded-xl bg-[#E8580A]/10 flex items-center justify-center text-[11px] font-bold text-[#E8580A] shrink-0">{ei + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white/80 truncate">{ex.name}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{ex.weight}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-bold text-white/50">{ex.sets}×{ex.reps}</p>
                      <p className="text-[10px] text-white/25 mt-0.5">{ex.rest}</p>
                    </div>
                  </div>
                ))}
                {w.exercises.length > 4 && (
                  <div className="px-4 py-2.5 border-t border-white/5">
                    <p className="text-xs text-white/25 font-medium">+{w.exercises.length - 4} exercícios</p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="px-4 pb-4 pt-3">
                <button onClick={() => onStartWorkout?.(w)}
                  className="w-full py-3.5 rounded-full bg-[#E8580A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(232,88,10,0.4)] hover:bg-[#d44f08] active:scale-[0.98] transition-all">
                  <Play size={14} fill="white" /> Iniciar Treino
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {(!student.workouts || student.workouts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/8 flex items-center justify-center mb-4">
              <Dumbbell size={26} className="text-white/20" />
            </div>
            <p className="text-white/35 text-sm font-medium">Nenhum treino atribuído ainda.</p>
            <p className="text-white/20 text-xs mt-1">Seu personal irá cadastrar em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
};