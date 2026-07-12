export interface Settings {
  name: string;
  goal: number;
  goalLabel: string;
  theme: 'dark' | 'light';
}

const DEFAULT: Settings = { name: 'Boris', goal: 4, goalLabel: 'Sèche 2026', theme: 'dark' };

function load(): Settings {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem('settings') || '{}') };
  } catch {
    return { ...DEFAULT };
  }
}

export const settings = $state<Settings>(load());

export function saveSettings(): void {
  localStorage.setItem('settings', JSON.stringify(settings));
  applyTheme();
}

export function applyTheme(): void {
  document.documentElement.setAttribute('data-theme', settings.theme);
}
