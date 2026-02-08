import { openDB, type IDBPDatabase } from 'idb';
import type { ISensor } from '../models/sensor';
import type { ILens } from '../models/lens';
import type { ITarget } from '../models/target';

const DB_NAME = 'opticbench';
const DB_VERSION = 1;

interface OpticBenchDB {
  sensors: { key: string; value: ISensor };
  lenses: { key: string; value: ILens };
  targets: { key: string; value: ITarget };
}

let dbInstance: IDBPDatabase<OpticBenchDB> | null = null;

async function getDb(): Promise<IDBPDatabase<OpticBenchDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<OpticBenchDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sensors')) {
        db.createObjectStore('sensors', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('lenses')) {
        db.createObjectStore('lenses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('targets')) {
        db.createObjectStore('targets', { keyPath: 'id' });
      }
    },
  });
  return dbInstance;
}

export async function saveUserSensors(sensors: ISensor[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('sensors', 'readwrite');
  await tx.store.clear();
  for (const s of sensors.filter(s => !s.isDefault)) {
    await tx.store.put(s);
  }
  await tx.done;
}

export async function loadUserSensors(): Promise<ISensor[]> {
  const db = await getDb();
  return db.getAll('sensors');
}

export async function saveUserLenses(lenses: ILens[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('lenses', 'readwrite');
  await tx.store.clear();
  for (const l of lenses.filter(l => !l.isDefault)) {
    await tx.store.put(l);
  }
  await tx.done;
}

export async function loadUserLenses(): Promise<ILens[]> {
  const db = await getDb();
  return db.getAll('lenses');
}

export async function saveUserTargets(targets: ITarget[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('targets', 'readwrite');
  await tx.store.clear();
  for (const t of targets.filter(t => !t.isDefault)) {
    await tx.store.put(t);
  }
  await tx.done;
}

export async function loadUserTargets(): Promise<ITarget[]> {
  const db = await getDb();
  return db.getAll('targets');
}
