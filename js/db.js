/* db.js — couche de stockage IndexedDB (offline-first, 100% local) */
const DB = (() => {
  const DB_NAME = 'muscu-tracker';
  const DB_VERSION = 1;
  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;

        if (!db.objectStoreNames.contains('exercises')) {
          db.createObjectStore('exercises', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('workouts')) {
          const s = db.createObjectStore('workouts', { keyPath: 'id' });
          s.createIndex('date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('sets')) {
          const s = db.createObjectStore('sets', { keyPath: 'id' });
          s.createIndex('workout_id', 'workout_id', { unique: false });
          s.createIndex('exercise_id', 'exercise_id', { unique: false });
        }
      };
      req.onsuccess = () => { _db = req.result; resolve(_db); };
      req.onerror = () => reject(req.error);
    });
  }

  function tx(store, mode = 'readonly') {
    return open().then((db) => db.transaction(store, mode).objectStore(store));
  }

  function reqToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // CRUD génériques
  function put(store, obj)   { return tx(store, 'readwrite').then((s) => reqToPromise(s.put(obj))); }
  function get(store, id)    { return tx(store).then((s) => reqToPromise(s.get(id))); }
  function del(store, id)    { return tx(store, 'readwrite').then((s) => reqToPromise(s.delete(id))); }
  function getAll(store)     { return tx(store).then((s) => reqToPromise(s.getAll())); }
  function count(store)      { return tx(store).then((s) => reqToPromise(s.count())); }

  function getAllByIndex(store, indexName, value) {
    return tx(store).then((s) => reqToPromise(s.index(indexName).getAll(value)));
  }

  // id unique simple
  function uid() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  return { open, put, get, del, getAll, count, getAllByIndex, uid };
})();
