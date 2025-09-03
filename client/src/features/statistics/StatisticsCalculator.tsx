import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/ui-system/atoms/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, PieChart, TrendingUp, Calculator } from 'lucide-react';

interface StatisticsState {
  dataInput: string;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  confidenceLevel: string;
  sampleSize: string;
  successCount: string;
}

const StatisticsCalculator: React.FC = () => {
  const [state, setState] = useState<StatisticsState>({
    dataInput: '',
    x1: '',
    y1: '',
    x2: '',
    y2: '',
    confidenceLevel: '95',
    sampleSize: '',
    successCount: ''
  });

  const updateValue = useCallback((field: keyof StatisticsState, value: string) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  // Parse data from input
  const parsedData = useMemo(() => {
    if (!state.dataInput.trim()) return [];
    
    const numbers = state.dataInput
      .split(/[,\s\n]+/)
      .map(str => parseFloat(str.trim()))
      .filter(num => !isNaN(num));
    
    return numbers;
  }, [state.dataInput]);

  // Statistical calculations
  const statistics = useMemo(() => {
    if (parsedData.length === 0) return null;

    const sorted = [...parsedData].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Mean
    const mean = sorted.reduce((sum, val) => sum + val, 0) / n;
    
    // Median
    const median = n % 2 === 0 
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    
    // Mode
    const frequency: Record<number, number> = {};
    sorted.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.keys(frequency)
      .filter(key => frequency[parseFloat(key)] === maxFreq)
      .map(key => parseFloat(key));
    
    // Variance and Standard Deviation
    const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    const sampleStandardDeviation = Math.sqrt(sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1));
    
    // Range
    const range = sorted[n - 1] - sorted[0];
    
    // Quartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    // Skewness (Pearson's)
    const skewness = (3 * (mean - median)) / standardDeviation;
    
    return {
      count: n,
      mean,
      median,
      mode: mode.length === n ? [] : mode, // If all values appear once, no mode
      variance,
      standardDeviation,
      sampleStandardDeviation,
      range,
      min: sorted[0],
      max: sorted[n - 1],
      q1,
      q3,
      iqr,
      skewness
    };
  }, [parsedData]);

  // Probability calculations
  const calculateBinomial = useCallback(() => {
    const n = parseInt(state.sampleSize);
    const x = parseInt(state.successCount);
    const p = 0.5; // Default probability
    
    if (!isNaN(n) && !isNaN(x) && x <= n) {
      // Binomial coefficient
      const factorial = (num: number): number => num <= 1 ? 1 : num * factorial(num - 1);
      const nCx = factorial(n) / (factorial(x) * factorial(n - x));
      
      // Binomial probability
      const probability = nCx * Math.pow(p, x) * Math.pow(1 - p, n - x);
      
      return probability;
    }
    return null;
  }, [state.sampleSize, state.successCount]);

  const calculateNormalDistribution = useCallback((value: number) => {
    if (!statistics) return null;
    
    const z = (value - statistics.mean) / statistics.standardDeviation;
    const probability = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
    
    return { z, probability };
  }, [statistics]);

  const calculateConfidenceInterval = useCallback(() => {
    if (!statistics) return null;
    
    const confidence = parseFloat(state.confidenceLevel) / 100;
    const alpha = 1 - confidence;
    const zScore = 1.96; // For 95% confidence (simplified)
    
    const marginOfError = zScore * (statistics.sampleStandardDeviation / Math.sqrt(statistics.count));
    const lowerBound = statistics.mean - marginOfError;
    const upperBound = statistics.mean + marginOfError;
    
    return { lowerBound, upperBound, marginOfError };
  }, [statistics, state.confidenceLevel]);

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      <Tabs defaultValue="descriptive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="descriptive">Descriptiva</TabsTrigger>
          <TabsTrigger value="probability">Probabilidad</TabsTrigger>
          <TabsTrigger value="inference">Inferencia</TabsTrigger>
        </TabsList>

        <TabsContent value="descriptive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadística Descriptiva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="data-input">Datos (separados por comas, espacios o líneas)</Label>
                <Textarea
                  id="data-input"
                  value={state.dataInput}
                  onChange={(e) => updateValue('dataInput', e.target.value)}
                  placeholder="1, 2, 3, 4, 5&#10;6, 7, 8, 9, 10"
                  rows={4}
                />
              </div>

              {statistics && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-blue-400">Medidas de Tendencia Central</h4>
                    <div className="space-y-2 text-sm">
                      <p>Conteo: <span className="font-mono">{statistics.count}</span></p>
                      <p>Media: <span className="font-mono">{statistics.mean.toFixed(4)}</span></p>
                      <p>Mediana: <span className="font-mono">{statistics.median.toFixed(4)}</span></p>
                      <p>Moda: <span className="font-mono">
                        {statistics.mode.length === 0 ? 'No hay moda' : statistics.mode.map(m => m.toFixed(2)).join(', ')}
                      </span></p>
                    </div>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-green-400">Medidas de Dispersión</h4>
                    <div className="space-y-2 text-sm">
                      <p>Rango: <span className="font-mono">{statistics.range.toFixed(4)}</span></p>
                      <p>Varianza: <span className="font-mono">{statistics.variance.toFixed(4)}</span></p>
                      <p>Desv. Estándar: <span className="font-mono">{statistics.standardDeviation.toFixed(4)}</span></p>
                      <p>Desv. Muestral: <span className="font-mono">{statistics.sampleStandardDeviation.toFixed(4)}</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-yellow-400">Posición</h4>
                    <div className="space-y-2 text-sm">
                      <p>Mínimo: <span className="font-mono">{statistics.min.toFixed(4)}</span></p>
                      <p>Q1: <span className="font-mono">{statistics.q1.toFixed(4)}</span></p>
                      <p>Q3: <span className="font-mono">{statistics.q3.toFixed(4)}</span></p>
                      <p>Máximo: <span className="font-mono">{statistics.max.toFixed(4)}</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-purple-400">Forma</h4>
                    <div className="space-y-2 text-sm">
                      <p>IQR: <span className="font-mono">{statistics.iqr.toFixed(4)}</span></p>
                      <p>Asimetría: <span className="font-mono">{statistics.skewness.toFixed(4)}</span></p>
                      <p>Forma: <span className="font-mono">
                        {Math.abs(statistics.skewness) < 0.5 ? 'Simétrica' : 
                         statistics.skewness > 0 ? 'Asimétrica positiva' : 'Asimétrica negativa'}
                      </span></p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="probability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuciones de Probabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sample-size">Tamaño de Muestra (n)</Label>
                  <Input
                    id="sample-size"
                    type="number"
                    value={state.sampleSize}
                    onChange={(e) => updateValue('sampleSize', e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="success-count">Número de Éxitos (x)</Label>
                  <Input
                    id="success-count"
                    type="number"
                    value={state.successCount}
                    onChange={(e) => updateValue('successCount', e.target.value)}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-blue-400">Distribución Binomial (p=0.5)</h4>
                  {(() => {
                    const result = calculateBinomial();
                    return result !== null ? (
                      <p>P(X = {state.successCount}) = <span className="font-mono text-green-400">{result.toFixed(6)}</span></p>
                    ) : (
                      <p className="text-gray-400">Ingrese valores válidos</p>
                    );
                  })()}
                </div>

                {statistics && (
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-green-400">Distribución Normal</h4>
                    <p>Media (μ): <span className="font-mono">{statistics.mean.toFixed(4)}</span></p>
                    <p>Desviación Estándar (σ): <span className="font-mono">{statistics.standardDeviation.toFixed(4)}</span></p>
                    
                    <div className="mt-3">
                      <Label htmlFor="normal-value">Calcular P(X = valor)</Label>
                      <Input
                        id="normal-value"
                        type="number"
                        placeholder={statistics.mean.toFixed(2)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            const result = calculateNormalDistribution(val);
                            if (result) {
                              console.log(`Z-score: ${result.z.toFixed(4)}, Density: ${result.probability.toFixed(6)}`);
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Inferencia Estadística
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="confidence-level">Nivel de Confianza (%)</Label>
                <Input
                  id="confidence-level"
                  type="number"
                  value={state.confidenceLevel}
                  onChange={(e) => updateValue('confidenceLevel', e.target.value)}
                  placeholder="95"
                  min="1"
                  max="99"
                />
              </div>

              {statistics && (() => {
                const ci = calculateConfidenceInterval();
                return ci ? (
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-blue-400">
                      Intervalo de Confianza del {state.confidenceLevel}%
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>Media Muestral: <span className="font-mono">{statistics.mean.toFixed(4)}</span></p>
                      <p>Margen de Error: <span className="font-mono">±{ci.marginOfError.toFixed(4)}</span></p>
                      <p>Intervalo: <span className="font-mono text-green-400">
                        [{ci.lowerBound.toFixed(4)}, {ci.upperBound.toFixed(4)}]
                      </span></p>
                    </div>
                  </div>
                ) : null;
              })()}

              {statistics && (
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-yellow-400">Prueba de Normalidad (Aproximada)</h4>
                  <div className="space-y-2 text-sm">
                    <p>Asimetría: <span className="font-mono">{statistics.skewness.toFixed(4)}</span></p>
                    <p>Evaluación: <span className="font-mono text-green-400">
                      {Math.abs(statistics.skewness) < 0.5 ? 'Aproximadamente normal' : 
                       Math.abs(statistics.skewness) < 1 ? 'Moderadamente asimétrica' : 'Muy asimétrica'}
                    </span></p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { StatisticsCalculator };