import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { calculationSchema, type CalculationResponse } from "@shared/schema";
import { z } from "zod";

// Utility functions for mathematical operations
function calculateBasicOperation(operation: string, a: number, b: number): number {
  switch (operation) {
    case "sum": return a + b;
    case "subtract": return a - b;
    case "multiply": return a * b;
    case "divide": 
      if (b === 0) throw new Error("División por cero no permitida");
      return a / b;
    default: throw new Error("Operación básica inválida");
  }
}

function calculateAdvancedOperation(operation: string, a: number, b?: number): number {
  switch (operation) {
    // Operaciones exponenciales y raíces
    case "power": 
      if (b === undefined) throw new Error("Se requiere exponente para potencia");
      return Math.pow(a, b);
    case "sqrt": 
      if (a < 0) throw new Error("No se puede calcular raíz cuadrada de número negativo");
      return Math.sqrt(a);
    case "cbrt": return Math.cbrt(a);
    
    // Logaritmos
    case "log": 
      if (b === undefined) throw new Error("Se requiere base para logaritmo");
      if (a <= 0 || b <= 0 || b === 1) throw new Error("Argumentos inválidos para logaritmo");
      return Math.log(a) / Math.log(b);
    case "ln": 
      if (a <= 0) throw new Error("Logaritmo natural requiere número positivo");
      return Math.log(a);
    case "log10": 
      if (a <= 0) throw new Error("Logaritmo base 10 requiere número positivo");
      return Math.log10(a);
    
    // Funciones trigonométricas
    case "sin": return Math.sin(a);
    case "cos": return Math.cos(a);
    case "tan": return Math.tan(a);
    case "asin": 
      if (a < -1 || a > 1) throw new Error("Arco seno requiere valor entre -1 y 1");
      return Math.asin(a);
    case "acos": 
      if (a < -1 || a > 1) throw new Error("Arco coseno requiere valor entre -1 y 1");
      return Math.acos(a);
    case "atan": return Math.atan(a);
    
    // Funciones hiperbólicas
    case "sinh": return Math.sinh(a);
    case "cosh": return Math.cosh(a);
    case "tanh": return Math.tanh(a);
    
    // Otras operaciones
    case "factorial": 
      if (a < 0 || !Number.isInteger(a)) throw new Error("Factorial requiere número entero no negativo");
      if (a > 170) throw new Error("Factorial demasiado grande");
      let result = 1;
      for (let i = 2; i <= a; i++) result *= i;
      return result;
    case "abs": return Math.abs(a);
    case "ceil": return Math.ceil(a);
    case "floor": return Math.floor(a);
    case "round": return Math.round(a);
    case "mod": 
      if (b === undefined) throw new Error("Se requiere divisor para módulo");
      if (b === 0) throw new Error("División por cero en módulo");
      return a % b;
    case "percent": return a / 100;
    
    default: throw new Error("Operación avanzada inválida");
  }
}

function getConstantValue(operation: string): number {
  switch (operation) {
    case "pi": return Math.PI;
    case "e": return Math.E;
    case "phi": return (1 + Math.sqrt(5)) / 2; // Golden ratio
    case "tau": return 2 * Math.PI;
    default: throw new Error("Constante inválida");
  }
}

function formatResult(result: number): string {
  // Manejar casos especiales
  if (!isFinite(result)) {
    if (isNaN(result)) return "Error";
    return result > 0 ? "∞" : "-∞";
  }
  
  // Formato para números muy grandes o muy pequeños
  if (Math.abs(result) >= 1e15 || (Math.abs(result) < 1e-6 && result !== 0)) {
    return result.toExponential(6);
  }
  
  // Formato normal con máximo 10 dígitos significativos
  const formatted = parseFloat(result.toPrecision(10)).toString();
  return formatted.length > 15 ? result.toExponential(6) : formatted;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Calculator endpoint
  app.post("/api/calculate", async (req, res) => {
    try {
      // Validate request body
      const calculation = calculationSchema.parse(req.body);
      
      let result: number;
      let error: string | undefined;
      
      try {
        switch (calculation.type) {
          case "basic":
            result = calculateBasicOperation(calculation.operation, calculation.a, calculation.b);
            break;
          case "advanced":
            result = calculateAdvancedOperation(calculation.operation, calculation.a, calculation.b);
            break;
          case "constant":
            result = getConstantValue(calculation.operation);
            break;
          default:
            throw new Error("Tipo de operación desconocido");
        }
      } catch (mathError) {
        error = mathError instanceof Error ? mathError.message : "Error de cálculo";
        result = NaN;
      }
      
      const response: CalculationResponse = { 
        result, 
        formatted: formatResult(result),
        error 
      };
      res.json(response);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Datos de solicitud inválidos",
          errors: error.errors
        });
      }
      
      res.status(500).json({ 
        message: "Error interno del servidor" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
