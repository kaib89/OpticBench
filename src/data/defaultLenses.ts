import { v4 as uuidv4 } from 'uuid';
import type { ILens } from '../models/lens';

export const defaultLenses: ILens[] = [
  { id: uuidv4(), name: "⚙ Generic Lens", focalLengthMm: 25, apertureMin: 1.4, apertureMax: 16, minWorkingDistanceMm: 100, maxImageCircleMm: 22, isGeneric: true, isDefault: true },
  { id: uuidv4(), name: "Tamron M112FM16 (16mm f/2.0)", focalLengthMm: 16, apertureMin: 2.0, apertureMax: 16, minWorkingDistanceMm: 100, maxImageCircleMm: 17.6, isGeneric: false, isDefault: true },
  { id: uuidv4(), name: "Tamron M112FM25 (25mm f/1.4)", focalLengthMm: 25, apertureMin: 1.4, apertureMax: 16, minWorkingDistanceMm: 150, maxImageCircleMm: 17.6, isGeneric: false, isDefault: true },
  { id: uuidv4(), name: "Tamron M112FM35 (35mm f/2.0)", focalLengthMm: 35, apertureMin: 2.0, apertureMax: 16, minWorkingDistanceMm: 200, maxImageCircleMm: 17.6, isGeneric: false, isDefault: true },
  { id: uuidv4(), name: "Tamron M112FM50 (50mm f/2.8)", focalLengthMm: 50, apertureMin: 2.8, apertureMax: 16, minWorkingDistanceMm: 300, maxImageCircleMm: 17.6, isGeneric: false, isDefault: true },
  { id: uuidv4(), name: "Edmund 33-303 (8mm f/1.4)", focalLengthMm: 8, apertureMin: 1.4, apertureMax: 16, minWorkingDistanceMm: 80, maxImageCircleMm: 11, isGeneric: false, isDefault: true },
  { id: uuidv4(), name: "Edmund 86-571 (12mm f/1.8)", focalLengthMm: 12, apertureMin: 1.8, apertureMax: 16, minWorkingDistanceMm: 100, maxImageCircleMm: 17.6, isGeneric: false, isDefault: true },
];
