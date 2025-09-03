import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Calculation, CalculationResponse, HistoryEntry, Memory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Download, RotateCcw, Calculator as CalcIcon, Sigma, Pi, MemoryStick } from "lucide-react";

export default function Calculator() {
  // Estados básicos de la calculadora
  const [display, setDisplay] = useState<string>("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  
  // Estados avanzados
  const [mode, setMode] = useState<"basic" | "scientific">("basic");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [memory, setMemory] = useState<Memory>({ value: 0, lastUpdated: new Date() });
  const [angleUnit, setAngleUnit] = useState<"deg" | "rad">("deg");
  
  const { toast } = useToast();

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedHistory = localStorage.getItem("calculator-history");
    const savedMemory = localStorage.getItem("calculator-memory");
    const savedMode = localStorage.getItem("calculator-mode");
    const savedAngleUnit = localStorage.getItem("calculator-angle-unit");
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error("Error loading history:", e);
      }
    }
    
    if (savedMemory) {
      try {
        const parsedMemory = JSON.parse(savedMemory);
        setMemory({
          ...parsedMemory,
          lastUpdated: new Date(parsedMemory.lastUpdated)
        });
      } catch (e) {
        console.error("Error loading memory:", e);
      }
    }
    
    if (savedMode) setMode(savedMode as "basic" | "scientific");
    if (savedAngleUnit) setAngleUnit(savedAngleUnit as "deg" | "rad");
  }, []);

  // Guardar datos en localStorage
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem("calculator-history", JSON.stringify(history));
    localStorage.setItem("calculator-memory", JSON.stringify(memory));
    localStorage.setItem("calculator-mode", mode);
    localStorage.setItem("calculator-angle-unit", angleUnit);
  }, [history, memory, mode, angleUnit]);

  useEffect(() => {
    saveToLocalStorage();
  }, [history, memory, mode, angleUnit, saveToLocalStorage]);

  // Añadir al historial
  const addToHistory = useCallback((expression: string, result: number, type: "basic" | "advanced" | "constant") => {
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date(),
      type
    };
    setHistory(prev => [historyEntry, ...prev.slice(0, 99)]); // Mantener solo 100 entradas
  }, []);

  const calculationMutation = useMutation({
    mutationFn: async (data: Calculation): Promise<CalculationResponse> => {
      const response = await apiRequest("POST", "/api/calculate", data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      const resultValue = data.formatted || data.result.toString();
      setDisplay(resultValue);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
      setCurrentOperation(null);
      
      // Añadir al historial
      let expression = "";
      if (variables.type === "basic") {
        const op = variables.operation === "sum" ? "+" : 
                  variables.operation === "subtract" ? "-" : 
                  variables.operation === "multiply" ? "×" : "÷";
        expression = `${variables.a} ${op} ${variables.b}`;
      } else if (variables.type === "advanced") {
        if (variables.b !== undefined) {
          expression = `${variables.operation}(${variables.a}, ${variables.b})`;
        } else {
          expression = `${variables.operation}(${variables.a})`;
        }
      } else if (variables.type === "constant") {
        expression = variables.operation;
      }
      
      addToHistory(expression, data.result, variables.type);
      
      if (data.error) {
        toast({
          title: "Advertencia",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error de Cálculo",
        description: error.message,
        variant: "destructive",
      });
      setDisplay("Error");
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
      setCurrentOperation(null);
    },
  });

  // Funciones de entrada
  const inputNumber = useCallback((num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  }, [display, waitingForNewValue]);

  const inputDecimal = useCallback(() => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  }, [display, waitingForNewValue]);

  const inputOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      
      calculationMutation.mutate({
        type: "basic",
        operation: operation as "sum" | "subtract" | "multiply" | "divide",
        a: currentValue,
        b: inputValue,
      });
      return;
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
    setCurrentOperation(nextOperation);
  }, [display, previousValue, operation, calculationMutation]);

  const calculate = useCallback(() => {
    if (operation && previousValue !== null) {
      const inputValue = parseFloat(display);
      
      calculationMutation.mutate({
        type: "basic",
        operation: operation as "sum" | "subtract" | "multiply" | "divide",
        a: previousValue,
        b: inputValue,
      });
    }
  }, [display, previousValue, operation, calculationMutation]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
    setCurrentOperation(null);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay("0");
    setWaitingForNewValue(false);
  }, []);

  const toggleSign = useCallback(() => {
    if (display !== "0") {
      setDisplay(display.charAt(0) === "-" ? display.slice(1) : "-" + display);
    }
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      setDisplay((value / 100).toString());
    }
  }, [display]);

  // Funciones científicas
  const executeAdvancedOperation = useCallback((op: string, requiresSecondValue = false) => {
    const a = parseFloat(display);
    if (isNaN(a)) return;

    let adjustedA = a;
    // Convertir ángulos si es necesario
    if (["sin", "cos", "tan"].includes(op) && angleUnit === "deg") {
      adjustedA = (a * Math.PI) / 180;
    }

    if (requiresSecondValue) {
      // Para operaciones que requieren dos valores, usar el sistema existente
      setPreviousValue(adjustedA);
      setOperation(op);
      setWaitingForNewValue(true);
      setCurrentOperation(op);
    } else {
      // Para operaciones unarias
      calculationMutation.mutate({
        type: "advanced",
        operation: op as any,
        a: adjustedA,
      });
    }
  }, [display, angleUnit, calculationMutation]);

  const insertConstant = useCallback((constant: string) => {
    calculationMutation.mutate({
      type: "constant",
      operation: constant as any,
    });
  }, [calculationMutation]);

  // Funciones de memoria
  const memoryStore = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      setMemory({ value, lastUpdated: new Date() });
      toast({ title: "Memoria", description: `Guardado: ${value}` });
    }
  }, [display, toast]);

  const memoryRecall = useCallback(() => {
    setDisplay(memory.value.toString());
    setWaitingForNewValue(true);
  }, [memory.value]);

  const memoryAdd = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      setMemory(prev => ({ value: prev.value + value, lastUpdated: new Date() }));
      toast({ title: "Memoria", description: `M+ = ${memory.value + value}` });
    }
  }, [display, memory.value, toast]);

  const memorySubtract = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      setMemory(prev => ({ value: prev.value - value, lastUpdated: new Date() }));
      toast({ title: "Memoria", description: `M- = ${memory.value - value}` });
    }
  }, [display, memory.value, toast]);

  const memoryClear = useCallback(() => {
    setMemory({ value: 0, lastUpdated: new Date() });
    toast({ title: "Memoria", description: "Memoria borrada" });
  }, [toast]);

  // Funciones de historial
  const clearHistory = useCallback(() => {
    setHistory([]);
    toast({ title: "Historial", description: "Historial borrado" });
  }, [toast]);

  const exportHistory = useCallback((format: "csv" | "json") => {
    let content = "";
    let filename = "";
    
    if (format === "csv") {
      content = "Expresión,Resultado,Tipo,Fecha\n" + 
        history.map(h => `"${h.expression}",${h.result},"${h.type}","${h.timestamp.toISOString()}"`).join("\n");
      filename = "historial-calculadora.csv";
    } else {
      content = JSON.stringify(history, null, 2);
      filename = "historial-calculadora.json";
    }
    
    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Exportar", description: `Historial exportado como ${format.toUpperCase()}` });
  }, [history, toast]);

  // Formateo del display
  const formatDisplay = (value: string) => {
    if (value === "Error" || value === "∞" || value === "-∞") return value;
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    
    // Si el número es muy grande, usar notación científica
    if (Math.abs(num) >= 1e9) {
      return num.toExponential(6);
    }
    
    // Limitar decimales para que quepa en pantalla
    return value.length > 12 ? num.toPrecision(8) : value;
  };

  const CalcButton = ({ 
    children, 
    onClick, 
    className = "", 
    type = "number",
    disabled = false
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string; 
    type?: "number" | "function" | "operator" | "scientific" | "memory"; 
    disabled?: boolean;
  }) => (
    <button
      className={`calc-button ${type} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      data-testid={`button-${children}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-6xl flex gap-6">
        {/* Calculadora principal */}
        <div className="flex-1 max-w-md">
          <div className="calc-container scale-in">
            {/* Header con modo y configuración */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button
                  variant={mode === "basic" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("basic")}
                  data-testid="mode-basic"
                >
                  <CalcIcon className="h-4 w-4 mr-1" />
                  Básica
                </Button>
                <Button
                  variant={mode === "scientific" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("scientific")}
                  data-testid="mode-scientific"
                >
                  <Sigma className="h-4 w-4 mr-1" />
                  Científica
                </Button>
              </div>
              
              {mode === "scientific" && (
                <div className="flex gap-2">
                  <Button
                    variant={angleUnit === "deg" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAngleUnit("deg")}
                    data-testid="angle-deg"
                  >
                    DEG
                  </Button>
                  <Button
                    variant={angleUnit === "rad" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAngleUnit("rad")}
                    data-testid="angle-rad"
                  >
                    RAD
                  </Button>
                </div>
              )}
            </div>

            {/* Display */}
            <div className="calc-display mb-4">
              <div className="w-full">
                {calculationMutation.isPending && (
                  <div className="text-right text-sm text-orange-400 mb-2">
                    Calculando...
                  </div>
                )}
                <div 
                  className="text-right text-4xl font-light text-white break-all"
                  data-testid="display"
                >
                  {formatDisplay(display)}
                </div>
                {memory.value !== 0 && (
                  <div className="text-right text-xs text-blue-400 mt-1">
                    M: {memory.value}
                  </div>
                )}
              </div>
            </div>

            {/* Botones de memoria */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <CalcButton onClick={memoryClear} type="memory" data-testid="memory-clear">
                MC
              </CalcButton>
              <CalcButton onClick={memoryRecall} type="memory" data-testid="memory-recall">
                MR
              </CalcButton>
              <CalcButton onClick={memoryAdd} type="memory" data-testid="memory-add">
                M+
              </CalcButton>
              <CalcButton onClick={memorySubtract} type="memory" data-testid="memory-subtract">
                M-
              </CalcButton>
              <CalcButton onClick={memoryStore} type="memory" data-testid="memory-store">
                MS
              </CalcButton>
            </div>

            {/* Botones científicos (solo en modo científico) */}
            {mode === "scientific" && (
              <div className="grid grid-cols-5 gap-2 mb-4">
                <CalcButton onClick={() => insertConstant("pi")} type="scientific" data-testid="constant-pi">
                  π
                </CalcButton>
                <CalcButton onClick={() => insertConstant("e")} type="scientific" data-testid="constant-e">
                  e
                </CalcButton>
                <CalcButton onClick={() => executeAdvancedOperation("sin")} type="scientific" data-testid="function-sin">
                  sin
                </CalcButton>
                <CalcButton onClick={() => executeAdvancedOperation("cos")} type="scientific" data-testid="function-cos">
                  cos
                </CalcButton>
                <CalcButton onClick={() => executeAdvancedOperation("tan")} type="scientific" data-testid="function-tan">
                  tan
                </CalcButton>
                
                <CalcButton onClick={() => executeAdvancedOperation("ln")} type="scientific" data-testid="function-ln">
                  ln
                </CalcButton>
                <CalcButton onClick={() => executeAdvancedOperation("log10")} type="scientific" data-testid="function-log">
                  log
                </CalcButton>
                <CalcButton onClick={() => executeAdvancedOperation("sqrt")} type="scientific" data-testid="function-sqrt">
                  √
                </CalcButton>
                <CalcButton onClick={() => executeAdvancedOperation("power", true)} type="scientific" data-testid="function-power">
                  x^y
                </CalcButton>
                <CalcButton onClick={() => executeAdvancedOperation("factorial")} type="scientific" data-testid="function-factorial">
                  x!
                </CalcButton>
              </div>
            )}

            {/* Botones principales */}
            <div className="calc-grid">
              {/* Row 1 */}
              <CalcButton onClick={clearAll} type="function" data-testid="clear-all">
                AC
              </CalcButton>
              <CalcButton onClick={clearEntry} type="function" data-testid="clear-entry">
                CE
              </CalcButton>
              <CalcButton onClick={toggleSign} type="function" data-testid="toggle-sign">
                ±
              </CalcButton>
              <CalcButton 
                onClick={() => inputOperation("divide")} 
                type="operator"
                className={currentOperation === "divide" ? "active" : ""}
                data-testid="operator-divide"
              >
                ÷
              </CalcButton>

              {/* Row 2 */}
              <CalcButton onClick={() => inputNumber("7")} data-testid="number-7">7</CalcButton>
              <CalcButton onClick={() => inputNumber("8")} data-testid="number-8">8</CalcButton>
              <CalcButton onClick={() => inputNumber("9")} data-testid="number-9">9</CalcButton>
              <CalcButton 
                onClick={() => inputOperation("multiply")} 
                type="operator"
                className={currentOperation === "multiply" ? "active" : ""}
                data-testid="operator-multiply"
              >
                ×
              </CalcButton>

              {/* Row 3 */}
              <CalcButton onClick={() => inputNumber("4")} data-testid="number-4">4</CalcButton>
              <CalcButton onClick={() => inputNumber("5")} data-testid="number-5">5</CalcButton>
              <CalcButton onClick={() => inputNumber("6")} data-testid="number-6">6</CalcButton>
              <CalcButton 
                onClick={() => inputOperation("subtract")} 
                type="operator"
                className={currentOperation === "subtract" ? "active" : ""}
                data-testid="operator-subtract"
              >
                -
              </CalcButton>

              {/* Row 4 */}
              <CalcButton onClick={() => inputNumber("1")} data-testid="number-1">1</CalcButton>
              <CalcButton onClick={() => inputNumber("2")} data-testid="number-2">2</CalcButton>
              <CalcButton onClick={() => inputNumber("3")} data-testid="number-3">3</CalcButton>
              <CalcButton 
                onClick={() => inputOperation("sum")} 
                type="operator"
                className={currentOperation === "sum" ? "active" : ""}
                data-testid="operator-sum"
              >
                +
              </CalcButton>

              {/* Row 5 */}
              <CalcButton onClick={() => inputNumber("0")} className="zero" data-testid="number-0">
                0
              </CalcButton>
              <CalcButton onClick={inputDecimal} data-testid="decimal">.</CalcButton>
              <CalcButton onClick={inputPercent} type="function" data-testid="percent">%</CalcButton>
              <CalcButton onClick={calculate} type="operator" data-testid="equals">
                =
              </CalcButton>
            </div>
          </div>
        </div>

        {/* Panel lateral con historial */}
        <div className="w-80">
          <Card className="neo-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MemoryStick className="h-5 w-5" />
                  Historial
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportHistory("csv")}
                    data-testid="export-csv"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportHistory("json")}
                    data-testid="export-json"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    data-testid="clear-history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {history.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No hay operaciones en el historial
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                        onClick={() => {
                          setDisplay(entry.result.toString());
                          setWaitingForNewValue(true);
                        }}
                        data-testid={`history-entry-${entry.id}`}
                      >
                        <div className="text-sm font-medium">{entry.expression}</div>
                        <div className="text-lg font-bold text-primary">= {entry.result}</div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span className="capitalize">{entry.type}</span>
                          <span>{entry.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}