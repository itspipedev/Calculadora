import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Calculation, CalculationResponse } from "@shared/schema";

export default function Calculator() {
  const [display, setDisplay] = useState<string>("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const { toast } = useToast();

  const calculationMutation = useMutation({
    mutationFn: async (data: Calculation): Promise<CalculationResponse> => {
      const response = await apiRequest("POST", "/api/calculate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setDisplay(data.result.toString());
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
      setCurrentOperation(null);
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

  const inputNumber = useCallback((num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  }, [display, waitingForNewValue]);

  const inputOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      
      calculationMutation.mutate({
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

  // Formateo del display
  const formatDisplay = (value: string) => {
    if (value === "Error") return value;
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    
    // Si el número es muy grande, usar notación científica
    if (Math.abs(num) >= 1e9) {
      return num.toExponential(3);
    }
    
    // Limitar decimales para que quepa en pantalla
    return num.toString().slice(0, 9);
  };

  const CalcButton = ({ 
    children, 
    onClick, 
    className = "", 
    type = "number" 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string; 
    type?: "number" | "function" | "operator"; 
  }) => (
    <button
      className={`calc-button ${type} ${className}`}
      onClick={onClick}
      data-testid={`button-${children}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="calc-container max-w-sm w-full scale-in">
        {/* Display */}
        <div className="calc-display">
          <div className="w-full">
            {calculationMutation.isPending && (
              <div className="text-right text-2xl text-orange-400 mb-2">
                Calculando...
              </div>
            )}
            <div 
              className="text-right text-5xl font-light text-white break-all"
              data-testid="display"
            >
              {formatDisplay(display)}
            </div>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="calc-grid">
          {/* Row 1 */}
          <CalcButton onClick={clearAll} type="function">
            AC
          </CalcButton>
          <CalcButton onClick={toggleSign} type="function">
            ±
          </CalcButton>
          <CalcButton onClick={inputPercent} type="function">
            %
          </CalcButton>
          <CalcButton 
            onClick={() => inputOperation("divide")} 
            type="operator"
            className={currentOperation === "divide" ? "active" : ""}
          >
            ÷
          </CalcButton>

          {/* Row 2 */}
          <CalcButton onClick={() => inputNumber("7")}>7</CalcButton>
          <CalcButton onClick={() => inputNumber("8")}>8</CalcButton>
          <CalcButton onClick={() => inputNumber("9")}>9</CalcButton>
          <CalcButton 
            onClick={() => inputOperation("multiply")} 
            type="operator"
            className={currentOperation === "multiply" ? "active" : ""}
          >
            ×
          </CalcButton>

          {/* Row 3 */}
          <CalcButton onClick={() => inputNumber("4")}>4</CalcButton>
          <CalcButton onClick={() => inputNumber("5")}>5</CalcButton>
          <CalcButton onClick={() => inputNumber("6")}>6</CalcButton>
          <CalcButton 
            onClick={() => inputOperation("subtract")} 
            type="operator"
            className={currentOperation === "subtract" ? "active" : ""}
          >
            -
          </CalcButton>

          {/* Row 4 */}
          <CalcButton onClick={() => inputNumber("1")}>1</CalcButton>
          <CalcButton onClick={() => inputNumber("2")}>2</CalcButton>
          <CalcButton onClick={() => inputNumber("3")}>3</CalcButton>
          <CalcButton 
            onClick={() => inputOperation("sum")} 
            type="operator"
            className={currentOperation === "sum" ? "active" : ""}
          >
            +
          </CalcButton>

          {/* Row 5 */}
          <CalcButton onClick={() => inputNumber("0")} className="zero">
            0
          </CalcButton>
          <CalcButton onClick={() => inputNumber(".")}>.</CalcButton>
          <CalcButton onClick={calculate} type="operator">
            =
          </CalcButton>
        </div>
      </div>
    </div>
  );
}
