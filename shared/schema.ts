import { z } from "zod";

// Calculator operation schema
export const calculationSchema = z.object({
  operation: z.enum(["sum", "subtract", "multiply", "divide"]),
  a: z.number(),
  b: z.number(),
});

export const calculationResponseSchema = z.object({
  result: z.number(),
});

export type Calculation = z.infer<typeof calculationSchema>;
export type CalculationResponse = z.infer<typeof calculationResponseSchema>;

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
