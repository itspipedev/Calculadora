import { z } from "zod";

// Calculator operation schemas
export const basicOperationSchema = z.object({
  operation: z.enum(["sum", "subtract", "multiply", "divide"]),
  a: z.number(),
  b: z.number(),
});

export const advancedOperationSchema = z.object({
  operation: z.enum([
    "power", "sqrt", "cbrt", "log", "ln", "log10",
    "sin", "cos", "tan", "asin", "acos", "atan",
    "sinh", "cosh", "tanh", "factorial", "abs",
    "ceil", "floor", "round", "mod", "percent"
  ]),
  a: z.number(),
  b: z.number().optional(),
});

export const constantSchema = z.object({
  operation: z.enum(["pi", "e", "phi", "tau"]),
});

export const calculationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("basic"),
    ...basicOperationSchema.shape,
  }),
  z.object({
    type: z.literal("advanced"),
    ...advancedOperationSchema.shape,
  }),
  z.object({
    type: z.literal("constant"),
    ...constantSchema.shape,
  }),
]);

export const calculationResponseSchema = z.object({
  result: z.number(),
  formatted: z.string().optional(),
  error: z.string().optional(),
});

// Historial de cálculos
export const historyEntrySchema = z.object({
  id: z.string(),
  expression: z.string(),
  result: z.number(),
  timestamp: z.date(),
  type: z.enum(["basic", "advanced", "constant"]),
});

// Memoria de calculadora
export const memorySchema = z.object({
  value: z.number(),
  lastUpdated: z.date(),
});

export type BasicOperation = z.infer<typeof basicOperationSchema>;
export type AdvancedOperation = z.infer<typeof advancedOperationSchema>;
export type Constant = z.infer<typeof constantSchema>;
export type Calculation = z.infer<typeof calculationSchema>;
export type CalculationResponse = z.infer<typeof calculationResponseSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export type Memory = z.infer<typeof memorySchema>;

// Keep existing user schemas for compatibility
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
