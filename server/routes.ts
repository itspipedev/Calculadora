import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { calculationSchema, type CalculationResponse } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Calculator endpoint
  app.post("/api/calculate", async (req, res) => {
    try {
      // Validate request body
      const { operation, a, b } = calculationSchema.parse(req.body);
      
      let result: number;
      
      switch (operation) {
        case "sum":
          result = a + b;
          break;
        case "subtract":
          result = a - b;
          break;
        case "multiply":
          result = a * b;
          break;
        case "divide":
          if (b === 0) {
            return res.status(400).json({ 
              message: "Division by zero is not allowed" 
            });
          }
          result = a / b;
          break;
        default:
          return res.status(400).json({ 
            message: "Invalid operation" 
          });
      }
      
      const response: CalculationResponse = { result };
      res.json(response);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: error.errors
        });
      }
      
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
