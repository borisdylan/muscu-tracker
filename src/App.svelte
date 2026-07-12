<script lang="ts">
  import type { Component } from 'svelte';
  import { router, match } from './lib/router.svelte';
  import TabBar from './components/TabBar.svelte';
  import Toast from './components/Toast.svelte';
  import Home from './routes/Home.svelte';
  import Train from './routes/Train.svelte';
  import Workout from './routes/Workout.svelte';
  import Stats from './routes/Stats.svelte';
  import History from './routes/History.svelte';
  import Profile from './routes/Profile.svelte';
  import Exercises from './routes/Exercises.svelte';
  import ExerciseDetail from './routes/ExerciseDetail.svelte';
  import ExerciseEdit from './routes/ExerciseEdit.svelte';
  import Templates from './routes/Templates.svelte';
  import TemplateEdit from './routes/TemplateEdit.svelte';
  import Calendar from './routes/Calendar.svelte';
  import Export from './routes/Export.svelte';

  type Resolved = { comp: Component<any>; props: Record<string, any> };

  const resolved = $derived.by((): Resolved => {
    const p = router.path;
    let m: Record<string, string> | null;
    if (match('/home', p)) return { comp: Home, props: {} };
    if (match('/train', p)) return { comp: Train, props: {} };
    if ((m = match('/workout/:id/:idx', p))) return { comp: Workout, props: { id: m.id, idx: parseInt(m.idx, 10) || 0 } };
    if ((m = match('/workout/:id', p))) return { comp: Workout, props: { id: m.id, idx: 0 } };
    if (match('/stats', p)) return { comp: Stats, props: {} };
    if (match('/history', p)) return { comp: History, props: {} };
    if (match('/profile', p)) return { comp: Profile, props: {} };
    if (match('/exercises', p)) return { comp: Exercises, props: {} };
    if ((m = match('/exercise-edit/:id', p))) return { comp: ExerciseEdit, props: { id: m.id } };
    if ((m = match('/exercise/:id', p))) return { comp: ExerciseDetail, props: { id: m.id } };
    if (match('/templates', p)) return { comp: Templates, props: {} };
    if ((m = match('/template-edit/:id', p))) return { comp: TemplateEdit, props: { id: m.id } };
    if (match('/calendar', p)) return { comp: Calendar, props: {} };
    if (match('/export', p)) return { comp: Export, props: {} };
    return { comp: Home, props: {} };
  });

  const Comp = $derived(resolved.comp);
</script>

{#key router.path}
  <Comp {...resolved.props} />
{/key}

<TabBar />
<Toast />
