import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const boolFromEnv = z.enum(["true", "false"]).transform((v) => v === "true");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_BASE_URL: z.string().url("APP_BASE_URL must be a valid URL."),
  SESSION_SECRET: z.string().min(16, "SESSION_SECRET must be at least 16 characters."),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),

  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email."),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters."),

  SHOPIFY_SHOP_DOMAIN: z.string().min(1, "SHOPIFY_SHOP_DOMAIN is required."),
  SHOPIFY_ACCESS_TOKEN: z.string().min(1, "SHOPIFY_ACCESS_TOKEN is required."),
  SHOPIFY_API_VERSION: z.string().min(1).default("2025-10"),
  SHOPIFY_USE_MOCK_DATA: boolFromEnv.default(true),

  DELHIVERY_BASE_URL: z.string().url("DELHIVERY_BASE_URL must be a valid URL."),
  DELHIVERY_API_KEY: z.string().min(1, "DELHIVERY_API_KEY is required."),
  DELHIVERY_USE_MOCK: boolFromEnv.default(true),

  SHIPMOZO_BASE_URL: z.string().url("SHIPMOZO_BASE_URL must be a valid URL."),
  SHIPMOZO_API_KEY: z.string().min(1, "SHIPMOZO_API_KEY is required."),
  SHIPMOZO_USE_MOCK: boolFromEnv.default(true)
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment validation failed:");
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;

export const assertLiveCredential = (service: "Shopify" | "Delhivery" | "Shipmozo", isMockEnabled: boolean, values: Record<string, string>) => {
  if (isMockEnabled) return;

  const missing = Object.entries(values)
    .filter(([, value]) => !value || !String(value).trim())
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`${service} sandbox live mode is enabled, but missing required credentials: ${missing.join(", ")}.`);
  }
};
