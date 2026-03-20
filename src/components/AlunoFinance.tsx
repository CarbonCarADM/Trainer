import React from 'react';
import { Student } from '../types';
import { CheckCircle2, AlertTriangle, CreditCard, Calendar, Clock } from 'lucide-react';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const AlunoFinance = ({ student }: { student: Student }) => {
  if (!student) return null;
  const isPago = student.paymentStatus === 'pago';
  const isAtrasado = student.paymentStatus === 'atrasado';

  return (
    <div className="pb-28 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-5">
        <h1 className="text-2xl font-black">Financeiro</h1>
        <p className="text-white/35 text-sm mt-0.5">Assinatura e histórico</p>
      </div>

      {/* Status card MOVO style */}
      <div className="px-5 mb-4">
        <div className={cx(
          'rounded-2xl p-5 border relative overflow-hidden',
          isPago ? 'bg-emerald-500/6 border-emerald-500/20' : isAtrasado ? 'bg-red-500/6 border-red-500/20' : 'bg-amber-500/6 border-amber-500/20'
        )}>
          <div className="flex items-center gap-4 mb-5">
            <div className={cx(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              isPago ? 'bg-emerald-500/15 text-emerald-400' : isAtrasado ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
            )}>
              {isPago ? <CheckCircle2 size={26} /> : isAtrasado ? <AlertTriangle size={26} /> : <Clock size={26} />}
            </div>
            <div>
              <p className="text-[10px] text-white/35 font-medium mb-0.5">Status da Mensalidade</p>
              <p className={cx('text-2xl font-black',
                isPago ? 'text-emerald-400' : isAtrasado ? 'text-red-400' : 'text-amber-400')}>
                {isPago ? 'Em Dia' : isAtrasado ? 'Atrasado' : 'Pendente'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/25 rounded-xl p-4 border border-white/6">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Mensalidade</p>
              <p className="text-xl font-black">R$ {student.monthlyFee.toFixed(2)}</p>
            </div>
            <div className="bg-black/25 rounded-xl p-4 border border-white/6">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Vencimento</p>
              <p className="text-xl font-black">Dia {student.paymentDueDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="px-5">
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Histórico</h3>
            <Calendar size={16} className="text-white/25" />
          </div>

          {student.paymentHistory?.length ? (
            student.paymentHistory.map((h, i) => (
              <div key={i} className={cx(
                'flex justify-between items-center p-4',
                i < student.paymentHistory.length - 1 ? 'border-b border-white/5' : ''
              )}>
                <div className="flex items-center gap-3">
                  <div className={cx(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    h.status === 'pago' ? 'bg-emerald-500/12 text-emerald-400' : 'bg-red-500/12 text-red-400'
                  )}>
                    {h.status === 'pago' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{h.date}</p>
                    <p className="text-[10px] text-white/35 font-medium">Mensalidade</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cx('font-bold text-sm', h.status === 'pago' ? 'text-emerald-400' : 'text-red-400')}>
                    R$ {h.amount.toFixed(2)}
                  </p>
                  <span className={cx(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full',
                    h.status === 'pago' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  )}>
                    {h.status === 'pago' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <CreditCard size={28} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/25 text-sm font-medium">Nenhum histórico ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};