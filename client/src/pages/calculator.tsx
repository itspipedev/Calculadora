import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Calculation, CalculationResponse } from "@shared/schema";
import { Plus, Minus, X, Divide, Calculator as CalcIcon, Sparkles, Zap, Star } from "lucide-react";

export default function Calculator() {
  const [operandA, setOperandA] = useState<string>("");
  const [operandB, setOperandB] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const calculationMutation = useMutation({
    mutationFn: async (data: Calculation): Promise<CalculationResponse> => {
      const response = await apiRequest("POST", "/api/calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
    },
    onError: (error: Error) => {
      toast({
        title: "Calculation Error",
        description: error.message,
        variant: "destructive",
      });
      setResult(null);
    },
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operandA || !operandB || !operation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before calculating.",
        variant: "destructive",
      });
      return;
    }

    const a = parseFloat(operandA);
    const b = parseFloat(operandB);

    if (isNaN(a) || isNaN(b)) {
      toast({
        title: "Invalid Numbers",
        description: "Please enter valid numbers.",
        variant: "destructive",
      });
      return;
    }

    calculationMutation.mutate({
      operation: operation as "sum" | "subtract" | "multiply" | "divide",
      a,
      b,
    });
  };

  const getOperationIcon = (op: string) => {
    switch (op) {
      case "sum": return <Plus className="w-5 h-5" />;
      case "subtract": return <Minus className="w-5 h-5" />;
      case "multiply": return <X className="w-5 h-5" />;
      case "divide": return <Divide className="w-5 h-5" />;
      default: return null;
    }
  };

  const getOperationSymbol = (op: string) => {
    switch (op) {
      case "sum": return "+";
      case "subtract": return "-";
      case "multiply": return "×";
      case "divide": return "÷";
      default: return "";
    }
  };

  const getOperationName = (op: string) => {
    switch (op) {
      case "sum": return "Addition";
      case "subtract": return "Subtraction";
      case "multiply": return "Multiplication";
      case "divide": return "Division";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 floating-animation"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 floating-animation" style={{animationDelay: "2s"}}></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 floating-animation" style={{animationDelay: "4s"}}></div>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto text-center mb-12 relative z-10 slide-up">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-intense">
            <CalcIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gradient">Calculadora</h1>
          <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Una calculadora súper moderna con efectos visuales dinámicos y una interfaz hermosa
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Calculator Card - Main Focus */}
          <div className="lg:col-span-2">
            <div className="gradient-border shadow-intense scale-in">
              <div className="gradient-border-inner">
                <CardContent className="p-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 mb-4">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-800">Calculadora Dinámica</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gradient-secondary mb-2">Realiza tus cálculos</h2>
                    <p className="text-muted-foreground">Ingresa dos números y selecciona una operación</p>
                  </div>

                  {/* Calculator Form */}
                  <form onSubmit={handleCalculate} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Input A */}
                      <div className="space-y-3 calc-input">
                        <Label htmlFor="operand-a" className="text-lg font-semibold flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          Primer Número (a)
                        </Label>
                        <Input
                          id="operand-a"
                          type="number"
                          placeholder="Ingresa el primer número"
                          value={operandA}
                          onChange={(e) => setOperandA(e.target.value)}
                          data-testid="input-operand-a"
                          className="h-14 text-lg border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white/50 backdrop-blur-sm"
                        />
                      </div>

                      {/* Input B */}
                      <div className="space-y-3 calc-input">
                        <Label htmlFor="operand-b" className="text-lg font-semibold flex items-center gap-2">
                          <Star className="w-4 h-4 text-blue-500" />
                          Segundo Número (b)
                        </Label>
                        <Input
                          id="operand-b"
                          type="number"
                          placeholder="Ingresa el segundo número"
                          value={operandB}
                          onChange={(e) => setOperandB(e.target.value)}
                          data-testid="input-operand-b"
                          className="h-14 text-lg border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    {/* Operation Select */}
                    <div className="space-y-3">
                      <Label htmlFor="operation" className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Operación
                      </Label>
                      <Select value={operation} onValueChange={setOperation}>
                        <SelectTrigger data-testid="select-operation" className="h-14 text-lg border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Selecciona una operación" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                          <SelectItem value="sum" className="text-lg py-3">
                            <div className="flex items-center gap-3">
                              <Plus className="w-5 h-5 text-green-500" />
                              <span>Suma (+)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="subtract" className="text-lg py-3">
                            <div className="flex items-center gap-3">
                              <Minus className="w-5 h-5 text-red-500" />
                              <span>Resta (-)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="multiply" className="text-lg py-3">
                            <div className="flex items-center gap-3">
                              <X className="w-5 h-5 text-blue-500" />
                              <span>Multiplicación (×)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="divide" className="text-lg py-3">
                            <div className="flex items-center gap-3">
                              <Divide className="w-5 h-5 text-purple-500" />
                              <span>División (÷)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Calculate Button */}
                    <Button 
                      type="submit"
                      disabled={calculationMutation.isPending}
                      data-testid="button-calculate"
                      className="w-full h-16 text-xl font-bold rounded-xl calc-button pulse-glow"
                      style={{
                        background: 'var(--gradient-primary)',
                        border: 'none'
                      }}
                    >
                      {calculationMutation.isPending ? (
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          Calculando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Zap className="w-6 h-6" />
                          Calcular
                        </div>
                      )}
                    </Button>
                  </form>

                  {/* Result Display */}
                  <div className="mt-10 p-8 rounded-2xl glass-effect border-2 border-purple-200/50">
                    <h3 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-500" />
                      Resultado
                    </h3>
                    
                    {calculationMutation.isPending && (
                      <div className="space-y-4">
                        <div className="animate-pulse space-y-3">
                          <div className="h-12 bg-gradient-to-r from-purple-200 to-blue-200 rounded-xl w-1/2"></div>
                          <div className="h-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg w-3/4"></div>
                        </div>
                      </div>
                    )}

                    {!calculationMutation.isPending && result !== null && operandA && operandB && operation && (
                      <div className="space-y-4 result-appear" data-testid="result-display">
                        <div className="text-6xl font-bold text-gradient-secondary mb-2">{result}</div>
                        <div className="text-xl text-muted-foreground flex items-center gap-2">
                          <span className="font-semibold">{operandA}</span>
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            {getOperationIcon(operation)}
                          </span>
                          <span className="font-semibold">{operandB}</span>
                          <span className="text-purple-500 font-bold">=</span>
                          <span className="font-bold text-gradient">{result}</span>
                        </div>
                      </div>
                    )}

                    {!calculationMutation.isPending && result === null && (
                      <div className="text-center py-8" data-testid="result-empty">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                          <CalcIcon className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-lg text-muted-foreground">
                          Ingresa los números y selecciona una operación para ver el resultado
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </div>
          </div>

          {/* Info Panel - Sidebar */}
          <div className="space-y-6 slide-up" style={{animationDelay: "0.3s"}}>
            {/* Operaciones Rápidas */}
            <div className="gradient-border shadow-intense">
              <div className="gradient-border-inner">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Operaciones
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "Suma", code: "sum", icon: Plus, color: "text-green-500", bg: "from-green-100 to-emerald-100" },
                      { name: "Resta", code: "subtract", icon: Minus, color: "text-red-500", bg: "from-red-100 to-pink-100" },
                      { name: "Multiplicación", code: "multiply", icon: X, color: "text-blue-500", bg: "from-blue-100 to-cyan-100" },
                      { name: "División", code: "divide", icon: Divide, color: "text-purple-500", bg: "from-purple-100 to-indigo-100" },
                    ].map((op, index) => (
                      <div 
                        key={op.code}
                        className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${op.bg} hover:scale-105 transition-transform cursor-pointer`}
                        onClick={() => setOperation(op.code)}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${op.color}`}>
                          <op.icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-700">{op.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            </div>

            {/* Características */}
            <div className="gradient-border shadow-intense">
              <div className="gradient-border-inner">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Características
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Interfaz súper moderna",
                      "Animaciones dinámicas",
                      "Efectos visuales únicos",
                      "Gradientes hermosos",
                      "Completamente responsiva"
                    ].map((feature, index) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </div>

            {/* API Info */}
            <div className="gradient-border shadow-intense">
              <div className="gradient-border-inner">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    API Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <p className="font-semibold text-blue-800 mb-1">Endpoint</p>
                      <code className="text-blue-600">POST /api/calculate</code>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                      <p className="font-semibold text-green-800 mb-1">Tecnologías</p>
                      <p className="text-green-600">React + Node.js + Express</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Footer */}
        <div className="mt-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 backdrop-blur-sm">
            <CalcIcon className="w-5 h-5 text-purple-600" />
            <span className="text-purple-800 font-semibold">Calculadora Súper Dinámica</span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-muted-foreground mt-4">
            Construida con ❤️ usando las tecnologías más modernas
          </p>
        </div>
      </main>
    </div>
  );
}
