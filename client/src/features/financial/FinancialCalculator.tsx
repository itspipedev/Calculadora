import React, { useState, useCallback } from 'react';
import { Button } from '@/ui-system/atoms/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';

interface FinancialState {
  principal: string;
  rate: string;
  periods: string;
  payment: string;
  futureValue: string;
  compoundFrequency: string;
}

const FinancialCalculator: React.FC = () => {
  const [state, setState] = useState<FinancialState>({
    principal: '',
    rate: '',
    periods: '',
    payment: '',
    futureValue: '',
    compoundFrequency: '12'
  });

  const [results, setResults] = useState<Record<string, number>>({});

  const updateValue = useCallback((field: keyof FinancialState, value: string) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculatePMT = useCallback(() => {
    const P = parseFloat(state.principal);
    const r = parseFloat(state.rate) / 100 / 12; // Monthly rate
    const n = parseFloat(state.periods);

    if (!isNaN(P) && !isNaN(r) && !isNaN(n) && r > 0) {
      const pmt = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setResults(prev => ({ ...prev, pmt }));
    }
  }, [state]);

  const calculatePV = useCallback(() => {
    const PMT = parseFloat(state.payment);
    const r = parseFloat(state.rate) / 100 / 12;
    const n = parseFloat(state.periods);

    if (!isNaN(PMT) && !isNaN(r) && !isNaN(n) && r > 0) {
      const pv = PMT * (1 - Math.pow(1 + r, -n)) / r;
      setResults(prev => ({ ...prev, pv }));
    }
  }, [state]);

  const calculateFV = useCallback(() => {
    const P = parseFloat(state.principal);
    const r = parseFloat(state.rate) / 100;
    const n = parseFloat(state.compoundFrequency);
    const t = parseFloat(state.periods) / 12; // Convert months to years

    if (!isNaN(P) && !isNaN(r) && !isNaN(n) && !isNaN(t)) {
      const fv = P * Math.pow(1 + r / n, n * t);
      setResults(prev => ({ ...prev, fv }));
    }
  }, [state]);

  const calculateCompoundInterest = useCallback(() => {
    const P = parseFloat(state.principal);
    const r = parseFloat(state.rate) / 100;
    const n = parseFloat(state.compoundFrequency);
    const t = parseFloat(state.periods);

    if (!isNaN(P) && !isNaN(r) && !isNaN(n) && !isNaN(t)) {
      const A = P * Math.pow(1 + r / n, n * t);
      const interest = A - P;
      setResults(prev => ({ ...prev, compoundInterest: interest, totalAmount: A }));
    }
  }, [state]);

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      <Tabs defaultValue="loan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loan">Préstamos</TabsTrigger>
          <TabsTrigger value="investment">Inversiones</TabsTrigger>
          <TabsTrigger value="compound">Interés Compuesto</TabsTrigger>
        </TabsList>

        <TabsContent value="loan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Calculadora de Préstamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="principal">Monto Principal ($)</Label>
                  <Input
                    id="principal"
                    type="number"
                    value={state.principal}
                    onChange={(e) => updateValue('principal', e.target.value)}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Tasa de Interés Anual (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={state.rate}
                    onChange={(e) => updateValue('rate', e.target.value)}
                    placeholder="5.5"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="periods">Períodos (meses)</Label>
                  <Input
                    id="periods"
                    type="number"
                    value={state.periods}
                    onChange={(e) => updateValue('periods', e.target.value)}
                    placeholder="360"
                  />
                </div>
                <div>
                  <Label htmlFor="payment">Pago Mensual ($)</Label>
                  <Input
                    id="payment"
                    type="number"
                    value={state.payment}
                    onChange={(e) => updateValue('payment', e.target.value)}
                    placeholder="567.79"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={calculatePMT} className="flex-1">
                  Calcular Pago
                </Button>
                <Button onClick={calculatePV} className="flex-1">
                  Calcular Valor Presente
                </Button>
              </div>

              {(results.pmt || results.pv) && (
                <div className="bg-slate-800 p-4 rounded-lg">
                  {results.pmt && (
                    <p className="text-green-400">
                      Pago Mensual: <span className="font-bold">${results.pmt.toFixed(2)}</span>
                    </p>
                  )}
                  {results.pv && (
                    <p className="text-blue-400">
                      Valor Presente: <span className="font-bold">${results.pv.toFixed(2)}</span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Calculadora de Inversiones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="investment">Inversión Inicial ($)</Label>
                  <Input
                    id="investment"
                    type="number"
                    value={state.principal}
                    onChange={(e) => updateValue('principal', e.target.value)}
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label htmlFor="return-rate">Tasa de Retorno Anual (%)</Label>
                  <Input
                    id="return-rate"
                    type="number"
                    value={state.rate}
                    onChange={(e) => updateValue('rate', e.target.value)}
                    placeholder="7"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="time-periods">Tiempo (meses)</Label>
                  <Input
                    id="time-periods"
                    type="number"
                    value={state.periods}
                    onChange={(e) => updateValue('periods', e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="compound-freq">Frecuencia de Capitalización</Label>
                  <Select value={state.compoundFrequency} onValueChange={(value) => updateValue('compoundFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Anual</SelectItem>
                      <SelectItem value="2">Semestral</SelectItem>
                      <SelectItem value="4">Trimestral</SelectItem>
                      <SelectItem value="12">Mensual</SelectItem>
                      <SelectItem value="365">Diaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateFV} className="w-full">
                Calcular Valor Futuro
              </Button>

              {results.fv && (
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p className="text-green-400">
                    Valor Futuro: <span className="font-bold">${results.fv.toFixed(2)}</span>
                  </p>
                  <p className="text-blue-400">
                    Ganancia: <span className="font-bold">${(results.fv - parseFloat(state.principal)).toFixed(2)}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compound" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Interés Compuesto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="compound-principal">Capital Inicial ($)</Label>
                  <Input
                    id="compound-principal"
                    type="number"
                    value={state.principal}
                    onChange={(e) => updateValue('principal', e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="compound-rate">Tasa de Interés Anual (%)</Label>
                  <Input
                    id="compound-rate"
                    type="number"
                    value={state.rate}
                    onChange={(e) => updateValue('rate', e.target.value)}
                    placeholder="8"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="compound-time">Tiempo (años)</Label>
                  <Input
                    id="compound-time"
                    type="number"
                    value={state.periods}
                    onChange={(e) => updateValue('periods', e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="compound-frequency">Frecuencia</Label>
                  <Select value={state.compoundFrequency} onValueChange={(value) => updateValue('compoundFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Anual</SelectItem>
                      <SelectItem value="2">Semestral</SelectItem>
                      <SelectItem value="4">Trimestral</SelectItem>
                      <SelectItem value="12">Mensual</SelectItem>
                      <SelectItem value="365">Diaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateCompoundInterest} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Calcular Interés Compuesto
              </Button>

              {(results.compoundInterest || results.totalAmount) && (
                <div className="bg-slate-800 p-4 rounded-lg space-y-2">
                  {results.totalAmount && (
                    <p className="text-green-400">
                      Monto Total: <span className="font-bold">${results.totalAmount.toFixed(2)}</span>
                    </p>
                  )}
                  {results.compoundInterest && (
                    <p className="text-blue-400">
                      Interés Ganado: <span className="font-bold">${results.compoundInterest.toFixed(2)}</span>
                    </p>
                  )}
                  {results.totalAmount && state.principal && (
                    <p className="text-yellow-400 text-sm">
                      ROI: {(((results.totalAmount - parseFloat(state.principal)) / parseFloat(state.principal)) * 100).toFixed(2)}%
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { FinancialCalculator };