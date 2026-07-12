import { readable, type Readable } from 'svelte/store';
import { liveQuery } from 'dexie';

/** adapte une requête Dexie liveQuery en store Svelte (réactif aux changements de la base) */
export function observe<T>(querier: () => T | Promise<T>, initial: T): Readable<T> {
  return readable<T>(initial, (set) => {
    const sub = liveQuery(querier).subscribe({
      next: (v) => set(v),
      error: (e) => console.error('liveQuery error', e),
    });
    return () => sub.unsubscribe();
  });
}
