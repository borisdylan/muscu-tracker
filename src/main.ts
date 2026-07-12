import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { ensureSeed } from './lib/seed';
import { applyTheme } from './lib/settings.svelte';

applyTheme();
if (!location.hash) location.hash = '#/home';

async function boot() {
  await ensureSeed();
  mount(App, { target: document.getElementById('app')! });
}

void boot();
