/* data.js — exercices prédéfinis (seed au 1er lancement) + repository métier */

const SEED_EXERCISES = [
  // Pectoraux
  { name: 'Développé couché', muscle_group: 'Pectoraux' },
  { name: 'Développé incliné haltères', muscle_group: 'Pectoraux' },
  { name: 'Écarté poulie', muscle_group: 'Pectoraux' },
  { name: 'Dips', muscle_group: 'Pectoraux' },
  // Dos
  { name: 'Soulevé de terre', muscle_group: 'Dos' },
  { name: 'Tractions', muscle_group: 'Dos' },
  { name: 'Rowing barre', muscle_group: 'Dos' },
  { name: 'Tirage vertical', muscle_group: 'Dos' },
  { name: 'Tirage horizontal', muscle_group: 'Dos' },
  // Jambes
  { name: 'Squat', muscle_group: 'Jambes' },
  { name: 'Presse à cuisses', muscle_group: 'Jambes' },
  { name: 'Fentes', muscle_group: 'Jambes' },
  { name: 'Leg curl', muscle_group: 'Jambes' },
  { name: 'Leg extension', muscle_group: 'Jambes' },
  { name: 'Mollets debout', muscle_group: 'Jambes' },
  // Épaules
  { name: 'Développé militaire', muscle_group: 'Épaules' },
  { name: 'Élévations latérales', muscle_group: 'Épaules' },
  { name: 'Oiseau', muscle_group: 'Épaules' },
  // Bras
  { name: 'Curl barre', muscle_group: 'Biceps' },
  { name: 'Curl haltères', muscle_group: 'Biceps' },
  { name: 'Extension triceps poulie', muscle_group: 'Triceps' },
  { name: 'Barre au front', muscle_group: 'Triceps' },
  // Abdos
  { name: 'Crunch', muscle_group: 'Abdos' },
  { name: 'Gainage', muscle_group: 'Abdos' },
];

const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Biceps', 'Triceps', 'Abdos', 'Autre'];

const Repo = {
  /* Seed au premier lancement uniquement */
  async ensureSeed() {
    const n = await DB.count('exercises');
    if (n > 0) return;
    for (const ex of SEED_EXERCISES) {
      await DB.put('exercises', { id: DB.uid(), name: ex.name, muscle_group: ex.muscle_group, notes: '', custom: false });
    }
  },

  // --- Exercices ---
  async allExercises() {
    const list = await DB.getAll('exercises');
    return list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  },
  getExercise(id) { return DB.get('exercises', id); },
  saveExercise(ex) {
    if (!ex.id) { ex.id = DB.uid(); ex.custom = true; }
    return DB.put('exercises', ex);
  },
  deleteExercise(id) { return DB.del('exercises', id); },

  // --- Templates ---
  async allTemplates() {
    const list = await DB.getAll('templates');
    return list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  },
  getTemplate(id) { return DB.get('templates', id); },
  saveTemplate(t) {
    if (!t.id) t.id = DB.uid();
    return DB.put('templates', t);
  },
  deleteTemplate(id) { return DB.del('templates', id); },

  // --- Séances ---
  async allWorkouts() {
    const list = await DB.getAll('workouts');
    return list.sort((a, b) => b.date.localeCompare(a.date)); // plus récent d'abord
  },
  getWorkout(id) { return DB.get('workouts', id); },
  saveWorkout(w) {
    if (!w.id) w.id = DB.uid();
    return DB.put('workouts', w);
  },
  async deleteWorkout(id) {
    const sets = await DB.getAllByIndex('sets', 'workout_id', id);
    for (const s of sets) await DB.del('sets', s.id);
    return DB.del('workouts', id);
  },

  // --- Séries ---
  setsOfWorkout(workoutId) { return DB.getAllByIndex('sets', 'workout_id', workoutId); },
  setsOfExercise(exerciseId) { return DB.getAllByIndex('sets', 'exercise_id', exerciseId); },
  saveSet(s) {
    if (!s.id) s.id = DB.uid();
    if (!s.created_at) s.created_at = new Date().toISOString();
    return DB.put('sets', s);
  },
  deleteSet(id) { return DB.del('sets', id); },

  /* Dernière séance (avant workoutId) où l'exercice a été fait → pour pré-remplissage
     et comparaison de progression. Renvoie { workout, sets } ou null. */
  async lastSessionOfExercise(exerciseId, excludeWorkoutId = null) {
    const sets = await DB.getAllByIndex('sets', 'exercise_id', exerciseId);
    if (!sets.length) return null;
    // regrouper par workout, récupérer les dates
    const byWorkout = {};
    for (const s of sets) {
      if (s.workout_id === excludeWorkoutId) continue;
      (byWorkout[s.workout_id] ||= []).push(s);
    }
    const wIds = Object.keys(byWorkout);
    if (!wIds.length) return null;
    const workouts = await Promise.all(wIds.map((id) => DB.get('workouts', id)));
    const valid = workouts.filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
    if (!valid.length) return null;
    const w = valid[0];
    const ws = byWorkout[w.id].sort((a, b) => a.set_number - b.set_number);
    return { workout: w, sets: ws };
  },
};

// e1RM (Epley) — estime la charge sur 1 rep, sert de signal de progression unifié
function e1RM(weight, reps) {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
