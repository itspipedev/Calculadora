export type BasicOperation = 'sum' | 'subtract' | 'multiply' | 'divide';
export type AdvancedOperation = 
  | 'power' | 'sqrt' | 'cbrt' | 'log' | 'ln' | 'log10'
  | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan'
  | 'sinh' | 'cosh' | 'tanh' | 'factorial' | 'abs'
  | 'ceil' | 'floor' | 'round' | 'mod' | 'percent';
export type ConstantOperation = 'pi' | 'e' | 'phi' | 'tau';

export type CalculationMode = 'basic' | 'scientific' | 'financial' | 'statistics' | 'geometry' | 'matrix';

export interface CalculationState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForNewValue: boolean;
  currentOperation: string | null;
  mode: CalculationMode;
  angleUnit: 'deg' | 'rad';
  precision: number;
}

export interface CalculationResult {
  result: number;
  formatted?: string;
  error?: string;
}

export interface FinancialCalculation {
  type: 'pmt' | 'pv' | 'fv' | 'rate' | 'nper';
  principal?: number;
  rate?: number;
  periods?: number;
  payment?: number;
  futureValue?: number;
}

export interface StatisticalData {
  values: number[];
  mean?: number;
  median?: number;
  mode?: number[];
  standardDeviation?: number;
  variance?: number;
}

export interface GeometryCalculation {
  type: 'area' | 'perimeter' | 'volume' | 'surface';
  shape: 'circle' | 'rectangle' | 'triangle' | 'sphere' | 'cylinder' | 'cone';
  dimensions: Record<string, number>;
}

export interface MatrixOperation {
  type: 'add' | 'subtract' | 'multiply' | 'determinant' | 'inverse' | 'transpose';
  matrices: number[][][];
}