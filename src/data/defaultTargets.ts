import { v4 as uuidv4 } from 'uuid';
import type { ITarget } from '../models/target';

export const defaultTargets: ITarget[] = [
  { id: uuidv4(), name: "⚙ Custom", widthMm: 100, heightMm: 100, depthMm: 10, isDefault: true },
  { id: uuidv4(), name: "48-Well Plate", widthMm: 127.8, heightMm: 85.5, depthMm: 20, isDefault: true },
  { id: uuidv4(), name: "96-Well Plate", widthMm: 127.8, heightMm: 85.5, depthMm: 15, isDefault: true },
  { id: uuidv4(), name: "Bee Cage (Hooper)", widthMm: 100, heightMm: 115, depthMm: 50, isDefault: true },
  { id: uuidv4(), name: "Petri Dish (100mm)", widthMm: 100, heightMm: 100, depthMm: 15, isDefault: true },
];
