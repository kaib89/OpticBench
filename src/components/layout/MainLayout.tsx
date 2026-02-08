import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { loadUserSensors, loadUserLenses, loadUserTargets, saveUserSensors, saveUserLenses, saveUserTargets } from '../../store/db';
import ConfigPanel from './ConfigPanel';
import CanvasView from './CanvasView';
import ResultsPanel from './ResultsPanel';
import DatabaseManager from '../database/DatabaseManager';

export default function MainLayout() {
  const dbManagerOpen = useStore(s => s.dbManagerOpen);
  const setDbManagerOpen = useStore(s => s.setDbManagerOpen);
  const setViewAxis = useStore(s => s.setViewAxis);
  const recalculate = useStore(s => s.recalculate);
  const sensors = useStore(s => s.sensors);
  const lenses = useStore(s => s.lenses);
  const targets = useStore(s => s.targets);
  const initialized = useRef(false);

  // Load user data from IndexedDB on mount
  useEffect(() => {
    async function loadData() {
      const [userSensors, userLenses, userTargets] = await Promise.all([
        loadUserSensors(), loadUserLenses(), loadUserTargets(),
      ]);
      const store = useStore.getState();
      if (userSensors.length) {
        store.setSensors([...store.sensors, ...userSensors]);
      }
      if (userLenses.length) {
        store.setLenses([...store.lenses, ...userLenses]);
      }
      if (userTargets.length) {
        store.setTargets([...store.targets, ...userTargets]);
      }
      store.recalculate();
      initialized.current = true;
    }
    loadData();
  }, []);

  // Persist user data to IndexedDB on changes
  useEffect(() => {
    if (!initialized.current) return;
    saveUserSensors(sensors);
  }, [sensors]);

  useEffect(() => {
    if (!initialized.current) return;
    saveUserLenses(lenses);
  }, [lenses]);

  useEffect(() => {
    if (!initialized.current) return;
    saveUserTargets(targets);
  }, [targets]);

  // Initial calculation
  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      switch (e.key) {
        case '1': setViewAxis('horizontal'); break;
        case '2': setViewAxis('vertical'); break;
        case '3': setViewAxis('diagonal'); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setViewAxis]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-11 min-h-[44px] bg-bg-panel border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-cyan">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <line x1="12" y1="0" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="20" x2="12" y2="24" stroke="currentColor" strokeWidth="1.5" />
              <line x1="0" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="20" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="font-semibold text-text-primary tracking-wide">OpticBench</span>
          </div>
          <span className="text-[10px] text-text-muted">Machine Vision Optics Planner</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDbManagerOpen(true)}
            className="text-xs text-text-secondary hover:text-text-primary px-3 py-1.5 border border-border rounded hover:border-cyan/30 transition-colors"
          >
            Database
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        <ConfigPanel />
        <CanvasView />
        <ResultsPanel />
      </div>

      <DatabaseManager open={dbManagerOpen} onClose={() => setDbManagerOpen(false)} />
    </div>
  );
}
