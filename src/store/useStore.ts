import { create } from 'zustand';
import type { ISensor } from '../models/sensor';
import type { ILens } from '../models/lens';
import type { ITarget } from '../models/target';
import type { IConfiguration, ICalculationResult, ViewAxis } from '../models/config';
import { defaultSensors } from '../data/defaultSensors';
import { defaultLenses } from '../data/defaultLenses';
import { defaultTargets } from '../data/defaultTargets';
import { calculate } from '../optics/calculations';

interface AppState {
  // Datenbank
  sensors: ISensor[];
  lenses: ILens[];
  targets: ITarget[];

  // Aktuelle Konfiguration
  config: IConfiguration;

  // Berechnungsergebnis
  result: ICalculationResult | null;

  // UI State
  dbManagerOpen: boolean;
  canvasVertical: boolean;

  // Actions
  setSensors: (sensors: ISensor[]) => void;
  setLenses: (lenses: ILens[]) => void;
  setTargets: (targets: ITarget[]) => void;

  selectSensor: (id: string) => void;
  selectLens: (id: string) => void;
  selectTarget: (id: string) => void;

  setWorkingDistance: (mm: number) => void;
  setAperture: (f: number) => void;
  setViewAxis: (axis: ViewAxis) => void;

  // Generisches Objektiv updaten
  updateGenericLens: (updates: Partial<ILens>) => void;
  // Benutzerdefiniertes Target updaten
  updateCustomTarget: (updates: Partial<ITarget>) => void;

  setDbManagerOpen: (open: boolean) => void;
  setCanvasVertical: (v: boolean) => void;

  // DB Mutations
  addSensor: (sensor: ISensor) => void;
  updateSensor: (sensor: ISensor) => void;
  deleteSensor: (id: string) => void;
  addLens: (lens: ILens) => void;
  updateLens: (lens: ILens) => void;
  deleteLens: (id: string) => void;
  addTarget: (target: ITarget) => void;
  updateTarget: (target: ITarget) => void;
  deleteTarget: (id: string) => void;

  importData: (data: { sensors?: ISensor[]; lenses?: ILens[]; targets?: ITarget[] }) => void;

  recalculate: () => void;
}

function performCalculation(state: {
  sensors: ISensor[];
  lenses: ILens[];
  targets: ITarget[];
  config: IConfiguration;
}): ICalculationResult | null {
  const { config, sensors, lenses, targets } = state;
  if (!config.sensorId || !config.lensId || !config.targetId) return null;

  const sensor = sensors.find(s => s.id === config.sensorId);
  const lens = lenses.find(l => l.id === config.lensId);
  const target = targets.find(t => t.id === config.targetId);

  if (!sensor || !lens || !target) return null;

  // Kann nicht berechnen wenn Abstand <= Brennweite
  if (config.workingDistanceMm <= lens.focalLengthMm) {
    return {
      fovHorizontalMm: 0, fovVerticalMm: 0, fovDiagonalMm: 0,
      magnification: 0,
      pixelsPerMmH: 0, pixelsPerMmV: 0, objectResolutionMmPerPx: 0,
      dofTotalMm: 0, dofNearMm: 0, dofFarMm: 0,
      halfAngleHorizontalDeg: 0, halfAngleVerticalDeg: 0, halfAngleDiagonalDeg: 0,
      effectiveAperture: 0, imageDistanceMm: 0,
      warnings: [{
        type: 'error',
        code: 'NO_REAL_IMAGE',
        message: 'Working distance must be greater than focal length. No real image can be formed.',
      }],
    };
  }

  return calculate(sensor, lens, target, config.workingDistanceMm, config.aperture);
}

export const useStore = create<AppState>((set) => ({
  sensors: defaultSensors,
  lenses: defaultLenses,
  targets: defaultTargets,

  config: {
    sensorId: defaultSensors[10]?.id ?? null, // IMX250
    lensId: defaultLenses[2]?.id ?? null, // Tamron 25mm
    targetId: defaultTargets[1]?.id ?? null, // 48-Well Plate
    workingDistanceMm: 300,
    aperture: 4.0,
    viewAxis: 'horizontal',
  },

  result: null,

  dbManagerOpen: false,
  canvasVertical: false,

  setSensors: (sensors) => set({ sensors }),
  setLenses: (lenses) => set({ lenses }),
  setTargets: (targets) => set({ targets }),

  selectSensor: (id) => {
    set(state => {
      const newConfig = { ...state.config, sensorId: id };
      const newState = { ...state, config: newConfig };
      return { config: newConfig, result: performCalculation(newState) };
    });
  },

  selectLens: (id) => {
    set(state => {
      const lens = state.lenses.find(l => l.id === id);
      const newConfig = {
        ...state.config,
        lensId: id,
        aperture: lens ? Math.max(state.config.aperture, lens.apertureMin) : state.config.aperture,
      };
      const newState = { ...state, config: newConfig };
      return { config: newConfig, result: performCalculation(newState) };
    });
  },

  selectTarget: (id) => {
    set(state => {
      const newConfig = { ...state.config, targetId: id };
      const newState = { ...state, config: newConfig };
      return { config: newConfig, result: performCalculation(newState) };
    });
  },

  setWorkingDistance: (mm) => {
    set(state => {
      const newConfig = { ...state.config, workingDistanceMm: mm };
      const newState = { ...state, config: newConfig };
      return { config: newConfig, result: performCalculation(newState) };
    });
  },

  setAperture: (f) => {
    set(state => {
      const newConfig = { ...state.config, aperture: f };
      const newState = { ...state, config: newConfig };
      return { config: newConfig, result: performCalculation(newState) };
    });
  },

  setViewAxis: (axis) => set(state => ({ config: { ...state.config, viewAxis: axis } })),

  updateGenericLens: (updates) => {
    set(state => {
      const lenses = state.lenses.map(l =>
        l.isGeneric ? { ...l, ...updates } : l
      );
      const newState = { ...state, lenses };
      return { lenses, result: performCalculation(newState) };
    });
  },

  updateCustomTarget: (updates) => {
    set(state => {
      const targets = state.targets.map(t =>
        t.name === '⚙ Custom' ? { ...t, ...updates } : t
      );
      const newState = { ...state, targets };
      return { targets, result: performCalculation(newState) };
    });
  },

  setDbManagerOpen: (open) => set({ dbManagerOpen: open }),
  setCanvasVertical: (v) => set({ canvasVertical: v }),

  addSensor: (sensor) => set(state => ({ sensors: [...state.sensors, sensor] })),
  updateSensor: (sensor) => set(state => ({
    sensors: state.sensors.map(s => s.id === sensor.id ? sensor : s),
  })),
  deleteSensor: (id) => set(state => ({
    sensors: state.sensors.filter(s => s.id !== id),
    config: state.config.sensorId === id ? { ...state.config, sensorId: null } : state.config,
  })),

  addLens: (lens) => set(state => ({ lenses: [...state.lenses, lens] })),
  updateLens: (lens) => set(state => ({
    lenses: state.lenses.map(l => l.id === lens.id ? lens : l),
  })),
  deleteLens: (id) => set(state => ({
    lenses: state.lenses.filter(l => l.id !== id),
    config: state.config.lensId === id ? { ...state.config, lensId: null } : state.config,
  })),

  addTarget: (target) => set(state => ({ targets: [...state.targets, target] })),
  updateTarget: (target) => set(state => ({
    targets: state.targets.map(t => t.id === target.id ? target : t),
  })),
  deleteTarget: (id) => set(state => ({
    targets: state.targets.filter(t => t.id !== id),
    config: state.config.targetId === id ? { ...state.config, targetId: null } : state.config,
  })),

  importData: (data) => {
    set(state => ({
      sensors: data.sensors ? [...state.sensors.filter(s => s.isDefault), ...data.sensors.filter(s => !s.isDefault)] : state.sensors,
      lenses: data.lenses ? [...state.lenses.filter(l => l.isDefault), ...data.lenses.filter(l => !l.isDefault)] : state.lenses,
      targets: data.targets ? [...state.targets.filter(t => t.isDefault), ...data.targets.filter(t => !t.isDefault)] : state.targets,
    }));
  },

  recalculate: () => {
    set(state => ({ result: performCalculation(state) }));
  },
}));
