import { z } from "zod";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Helper for MongoDB ObjectId strings
export const objectIdSchema = z.string().trim().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid ID format" }
);

// Helper for MoMo phone numbers (10 to 12 digits)
export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10,12}$/, "Invalid phone number format (expected 10-12 digits)");

// 1. buyData route schema
export const buyDataSchema = z.object({
  network: z.string().trim().min(1, "Network is required"),
  bundleId: objectIdSchema,
  phoneNumber: phoneNumberSchema,
});

// 2. buyDataNoAccount route schema
export const buyDataNoAccountSchema = z.object({
  network: z.string().trim().min(1, "Network is required"),
  bundleName: z.string().trim().min(1, "Bundle name is required"),
  price: z.number().positive("Price must be a positive number"),
  phoneNumber: phoneNumberSchema,
  reference: z.string().trim().min(1, "Payment reference is required"),
});

// 3. Agent withdrawal request schema
export const withdrawSchema = z.object({
  amount: z.number().min(50, "Minimum withdrawal amount is GH₵ 50.00"),
  phoneNumber: phoneNumberSchema,
  momoName: z.string().trim().min(1, "MoMo account name is required"),
});

// 4. User registration schema
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: phoneNumberSchema.optional().or(z.literal("")),
});

// 5. User login schema
export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// 6. Paystack webhook metadata schemas
export const paystackStandardMetadataSchema = z.object({
  purchaseType: z.literal("standard"),
  network: z.string().trim().min(1, "Network is required"),
  bundleName: z.string().trim().min(1, "Bundle name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  phoneNumber: phoneNumberSchema,
  userId: objectIdSchema.optional(),
});

export const paystackAgentStoreMetadataSchema = z.object({
  purchaseType: z.literal("agent_store"),
  bundleId: objectIdSchema,
  agentId: objectIdSchema,
  phoneNumber: phoneNumberSchema,
});

export const paystackTopUpMetadataSchema = z.object({
  purchaseType: z.literal("top_up"),
  userId: objectIdSchema,
  amount: z.coerce.number().min(10, "Amount must be positive"),
  reference: z.string().trim().min(1, "Reference is required"),
});

/**
 * Validates an incoming HTTP request body against a Zod schema.
 * Returns either { success: true, data: T } or { success: false, response: NextResponse }.
 */
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const issue = result.error.issues[0];
      const errorMsg = issue
        ? `${issue.path.length ? issue.path.join(".") + ": " : ""}${issue.message}`
        : "Invalid request payload";
      return {
        success: false,
        response: NextResponse.json({ error: errorMsg, message: errorMsg }, { status: 400 }),
      };
    }
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: "Invalid JSON body payload", message: "Invalid JSON body payload" }, { status: 400 }),
    };
  }
}
