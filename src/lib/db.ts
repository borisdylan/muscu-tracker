import Dexie, { type Table } from 'dexie';
import type { Exercise, WorkoutTemplate, Workout, SetEntry } from './types';

class MuscuDB extends Dexie {
  exercises!: Table<Exercise, string>;
  templates!: Table<WorkoutTemplate, string>;
  workouts!: Table<Workout, string>;
  sets!: Table<SetEntry, string>;

  constructor() {
    super('muscu-tracker-v2');
    this.version(1).stores({
      exercises: 'id, muscle_group',
      templates: 'id',
      workouts: 'id, date',
      sets: 'id, workout_id, exercise_id',
    });
  }
}

export const db = new MuscuDB();

export const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

/** e1RM (Epley) — estime la charge sur 1 rep, signal de progression unifié */
export const e1RM = (weight: number, reps: number): number => {
  if (!weight || !reps) return 0;
  return reps === 1 ? weight : weight * (1 + reps / 30);
};
