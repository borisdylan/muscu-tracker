<script lang="ts">
  import { db } from '../lib/db';
  import { todayISO, fmtDateFull, daysAgo } from '../lib/format';
  import { toast } from '../lib/toast.svelte';
  import Header from '../components/Header.svelte';

  interface Row {
    date: string; seance: string; exercice: string; groupe: string;
    serie: number; poids_kg: number; reps: number; rpe: number | string; echec: string; notes: string;
  }

  let period = $state('all');
  let preview = $state('');

  async function gather(): Promise<Row[]> {
    const days = period === 'all' ? Infinity : parseInt(period, 10);
    const workouts = (await db.workouts.toArray())
      .filter((w) => days === Infinity || daysAgo(w.date) < days)
      .sort((a, b) => a.date.localeCompare(b.date));
    const rows: Row[] = [];
    for (const w of workouts) {
      const ss = (await db.sets.where('workout_id').equals(w.id).toArray()).sort((a, b) => a.set_number - b.set_number);
      for (const s of ss) {
        const ex = await db.exercises.get(s.exercise_id);
        rows.push({
          date: w.date, seance: w.name || 'Séance libre', exercice: ex?.name ?? '(supprimé)', groupe: ex?.muscle_group ?? '',
          serie: s.set_number, poids_kg: s.weight_kg, reps: s.reps, rpe: s.rpe ?? '', echec: s.failed ? 'oui' : '', notes: ex?.notes ?? '',
        });
      }
    }
    return rows;
  }

  function toCSV(rows: Row[]): string {
    const cols: (keyof Row)[] = ['date', 'seance', 'exercice', 'groupe', 'serie', 'poids_kg', 'reps', 'rpe', 'echec', 'notes'];
    const esc = (v: unknown) => { const s = String(v ?? ''); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return cols.join(',') + '\n' + rows.map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n');
  }
  function toMD(rows: Row[]): string {
    let md = '# Historique musculation\n\nExport du ' + new Date().toLocaleDateString('fr-FR') + '\n\n';
    const byDate: Record<string, Row[]> = {};
    for (const r of rows) (byDate[r.date] ||= []).push(r);
    for (const date of Object.keys(byDate).sort()) {
      const rs = byDate[date];
      md += `## ${fmtDateFull(date)} — ${rs[0].seance}\n\n`;
      const byEx: Record<string, Row[]> = {};
      for (const r of rs) (byEx[r.exercice] ||= []).push(r);
      for (const ex of Object.keys(byEx)) {
        md += `**${ex}**\n\n| Série | Poids (kg) | Reps | RPE | Échec |\n|---|---|---|---|---|\n`;
        for (const r of byEx[ex]) md += `| ${r.serie} | ${r.poids_kg} | ${r.reps} | ${r.rpe} | ${r.echec} |\n`;
        md += '\n';
      }
    }
    return md;
  }
  function download(name: string, text: string, mime: string) {
    const blob = new Blob([text], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function refresh() {
    const rows = await gather();
    preview = rows.length ? toMD(rows).slice(0, 4000) : 'Aucune donnée sur cette période.';
  }
  $effect(() => { void period; refresh(); });

  async function exportCSV() { const r = await gather(); if (!r.length) return toast('Aucune donnée'); download(`muscu-${todayISO()}.csv`, '﻿' + toCSV(r), 'text/csv'); toast('CSV exporté'); }
  async function exportMD() { const r = await gather(); if (!r.length) return toast('Aucune donnée'); download(`muscu-${todayISO()}.md`, toMD(r), 'text/markdown'); toast('Markdown exporté'); }
  async function copyMD() { const r = await gather(); if (!r.length) return toast('Aucune donnée'); try { await navigator.clipboard.writeText(toMD(r)); toast('Copié !'); } catch { toast('Copie impossible'); } }
</script>

<div class="screen">
  <Header title="Export" back />
  <div class="card" style="background:var(--accent-soft);box-shadow:none;color:var(--accent-text)">
    Exporte tes données pour les sauvegarder ou les analyser dans ton projet Claude « Fitness - Sèche 2026 ». Pense à le faire chaque fin de semaine.
  </div>
  <label class="fld">Période</label>
  <select class="inp" bind:value={period}>
    <option value="all">Tout l'historique</option>
    <option value="7">7 derniers jours</option>
    <option value="30">30 derniers jours</option>
    <option value="90">90 derniers jours</option>
  </select>
  <div class="btn-row" style="margin-top:16px">
    <button class="btn" onclick={exportCSV}>⬇ CSV</button>
    <button class="btn secondary" onclick={exportMD}>⬇ Markdown</button>
  </div>
  <button class="btn ghost" style="margin-top:10px" onclick={copyMD}>📋 Copier le Markdown</button>
  <div class="section-title">Aperçu</div>
  <pre class="card export-prev">{preview}</pre>
</div>
