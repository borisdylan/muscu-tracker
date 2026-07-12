export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  notes: string;
  custom: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercise_ids: string[];
}

export interface Workout {
  id: string;
  date: string; // ISO YYYY-MM-DD
  template_id: string | null;
  name: string;
  notes: string;
  planned: string[]; // ordre des exercices prévus ce jour-là
}

export interface SetEntry {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  failed: boolean;
  created_at: string;
}
