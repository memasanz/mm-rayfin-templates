import { PeriodMetrics } from './PeriodMetrics.js';
import { Practices } from './Practices.js';

export const schema = [Practices, PeriodMetrics];

export type AppSchema = {
  Practices: Practices;
  PeriodMetrics: PeriodMetrics;
};
