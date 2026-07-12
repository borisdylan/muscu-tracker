import { db, uid } from './db';
import { todayISO } from './format';
import { go } from './router.svelte';
import type { Workout, WorkoutTemplate, SetEntry } from './types';

export async function createWorkout(template: WorkoutTemplate | null): Promise<void> {
  const w: Workout = {
    id: uid(),
    date: todayISO(),
    template_id: template ? template.id : null,
    name: template ? template.name : 'Séance libre',
    notes: '',
    planned: template ? [...template.exercise_ids] : [],
  };
  await db.workouts.add(w);
  go('/workout/' + w.id);
}

export async function addSet(
  partial: Omit<SetEntry, 'id' | 'created_at'>,
): Promise<void> {
  await db.sets.add({ ...partial, id: uid(), created_at: new Date().toISOString() });
}

export async function deleteWorkout(id: string): Promise<void> {
  await db.transaction('rw', db.workouts, db.sets, async () => {
    await db.sets.where('workout_id').equals(id).delete();
    await db.workouts.delete(id);
  });
}

/** ajoute un exercice à la liste "prévue" d'une séance */
export async function addPlanned(wid: string, exId: string): Promise<void> {
  const w = await db.workouts.get(wid);
  if (!w) return;
  if (!w.planned.includes(exId)) {
    w.planned = [...w.planned, exId];
    await db.workouts.put(w);
  }
}
