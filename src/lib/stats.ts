import { e1RM } from './db';
import type { SetEntry, Workout } from './types';

export interface WorkoutStat {
  volume: number;
  exCount: number;
  setCount: number;
  sets: SetEntry[];
}

export function workoutStats(wid: string, sets: SetEntry[]): WorkoutStat {
  const ws = sets.filter((s) => s.workout_id === wid);
  return {
    volume: ws.reduce((a, s) => a + s.weight_kg * s.reps, 0),
    exCount: new Set(ws.map((s) => s.exercise_id)).size,
    setCount: ws.length,
    sets: ws,
  };
}

/** ids des séances qui détiennent le record de charge d'au moins un exercice */
export function prWorkouts(sets: SetEntry[]): Set<string> {
  const best: Record<string, { weight: number; wid: string }> = {};
  for (const s of sets) {
    const b = best[s.exercise_id];
    if (!b || s.weight_kg > b.weight) best[s.exercise_id] = { weight: s.weight_kg, wid: s.workout_id };
  }
  return new Set(Object.values(best).map((b) => b.wid));
}

/** compare une série à la meilleure de la dernière séance (même reps prioritaire, sinon e1RM) */
export type Trend = { cls: 'up' | 'down' | 'flat'; sym: string };
export function trendVsLast(set: SetEntry, lastSets: SetEntry[]): Trend {
  if (!lastSets.length) return { cls: 'flat', sym: '' };
  const same = lastSets.filter((s) => s.reps === set.reps && !s.failed);
  let cur: number, ref: number;
  if (same.length) {
    ref = Math.max(...same.map((s) => s.weight_kg));
    cur = set.weight_kg;
  } else {
    ref = Math.max(...lastSets.filter((s) => !s.failed).map((s) => e1RM(s.weight_kg, s.reps)));
    cur = e1RM(set.weight_kg, set.reps);
  }
  const eps = 0.01;
  if (cur > ref + eps) return { cls: 'up', sym: '▲' };
  if (cur < ref - eps) return { cls: 'down', sym: '▼' };
  return { cls: 'flat', sym: '=' };
}

/** dernière séance (hors excludeWid) où l'exercice a été fait, avec ses séries triées */
export function lastSessionOf(
  exerciseId: string,
  sets: SetEntry[],
  workouts: Workout[],
  excludeWid: string | null,
): { workout: Workout; sets: SetEntry[] } | null {
  const byWorkout: Record<string, SetEntry[]> = {};
  for (const s of sets) {
    if (s.exercise_id !== exerciseId || s.workout_id === excludeWid) continue;
    (byWorkout[s.workout_id] ||= []).push(s);
  }
  const candidates = workouts
    .filter((w) => byWorkout[w.id])
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!candidates.length) return null;
  const w = candidates[0];
  return { workout: w, sets: byWorkout[w.id].sort((a, b) => a.set_number - b.set_number) };
}

/** semaines consécutives (jusqu'à cette semaine) avec ≥1 séance */
export function computeStreak(dates: string[], weekStartFn: (d?: Date) => Date): number {
  if (!dates.length) return 0;
  const weeks = new Set(dates.map((iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return +weekStartFn(new Date(y, m - 1, d));
  }));
  let streak = 0;
  let cur = +weekStartFn();
  while (weeks.has(cur)) {
    streak++;
    cur -= 7 * 86400000;
  }
  return streak;
}
