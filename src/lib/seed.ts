import { db, uid } from './db';

export const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Biceps', 'Triceps', 'Abdos', 'Autre'];

const SEED: Array<[string, string]> = [
  ['Développé couché', 'Pectoraux'],
  ['Développé incliné haltères', 'Pectoraux'],
  ['Écarté poulie', 'Pectoraux'],
  ['Dips', 'Pectoraux'],
  ['Soulevé de terre', 'Dos'],
  ['Tractions', 'Dos'],
  ['Rowing barre', 'Dos'],
  ['Tirage vertical', 'Dos'],
  ['Tirage horizontal', 'Dos'],
  ['Squat', 'Jambes'],
  ['Presse à cuisses', 'Jambes'],
  ['Fentes', 'Jambes'],
  ['Leg curl', 'Jambes'],
  ['Leg extension', 'Jambes'],
  ['Mollets debout', 'Jambes'],
  ['Développé militaire', 'Épaules'],
  ['Élévations latérales', 'Épaules'],
  ['Oiseau', 'Épaules'],
  ['Curl barre', 'Biceps'],
  ['Curl haltères', 'Biceps'],
  ['Extension triceps poulie', 'Triceps'],
  ['Barre au front', 'Triceps'],
  ['Crunch', 'Abdos'],
  ['Gainage', 'Abdos'],
];

export async function ensureSeed(): Promise<void> {
  const n = await db.exercises.count();
  if (n > 0) return;
  await db.exercises.bulkAdd(
    SEED.map(([name, muscle_group]) => ({ id: uid(), name, muscle_group, notes: '', custom: false })),
  );
}
