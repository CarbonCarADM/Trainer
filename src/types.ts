export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  videoUrl?: string;
  completed?: boolean;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  date: string;
  feedback?: 'fácil' | 'médio' | 'difícil' | null;
  completedExercises?: string[];
}

// 0=Dom … 6=Sáb — null = descanso
export type WeekPlan = { [day: number]: string | null };

export interface PaymentRecord {
  date: string;
  amount: number;
  status: 'pago' | 'pendente';
}

export interface Measurement {
  date: string;
  weight: number;
  chest?: number;
  waist?: number;
  hip?: number;
  thigh?: number;
  arm?: number;
}

export interface Student {
  id: string;
  name: string;
  avatar?: string;
  age?: number;
  gym?: string;           // academia que malha
  email: string;
  whatsapp: string;
  goal: string;
  status: 'active' | 'inactive' | 'late';
  engagementScore: number;
  lastWorkoutDate: string;
  streak: number;
  monthlyFee: number;
  paymentDueDay: number;
  paymentStatus: 'pago' | 'pendente' | 'atrasado';
  paymentHistory: PaymentRecord[];
  workouts: Workout[];
  weekPlan?: WeekPlan;
  weightHistory: { date: string; weight: number }[];
  goalWeight?: number;
  measurements: Measurement[];
  level: number;
  xp: number;
  workoutFeedback: { workoutId: string; feedback: 'fácil' | 'médio' | 'difícil'; date: string }[];
  notes?: string;         // observações do personal
}

export interface BrandConfig {
  nome: string;
  corPrimaria: string;
  corSecundaria: string;
  logo: string;
  whatsapp: string;
  tagline: string;
  heroImage: string;
}