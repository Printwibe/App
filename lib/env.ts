/**
 * Environment Variable Validation
 * Validates all required environment variables on application startup
 */

const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "ADMIN_JWT_SECRET",
] as const;

const optionalEnvVars = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "BLOB_READ_WRITE_TOKEN",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_NAME",
  "ADMIN_EMAIL",
  "RESEND_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GMAIL_USER",
  "GMAIL_PASSWORD",
] as const;

interface Env {
  MONGODB_URI: string;
  JWT_SECRET: string;
  ADMIN_JWT_SECRET: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID?: string;
  BLOB_READ_WRITE_TOKEN?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_APP_NAME?: string;
  ADMIN_EMAIL?: string;
  RESEND_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  GMAIL_USER?: string;
  GMAIL_PASSWORD?: string;
  NODE_ENV: "development" | "production" | "test";
}

function validateEnv(): Env {
  const missingVars: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars
        .map((v) => `  - ${v}`)
        .join("\n")}\n\n` +
        `Please copy .env.example to .env and fill in the required values.`
    );
  }

  // Validate JWT secrets are strong enough
  const jwtSecret = process.env.JWT_SECRET!;
  const adminJwtSecret = process.env.ADMIN_JWT_SECRET!;

  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  if (adminJwtSecret.length < 32) {
    throw new Error("ADMIN_JWT_SECRET must be at least 32 characters long");
  }

  // Check for default/insecure values
  const insecureValues = [
    "your-secret-key",
    "change-this",
    "your-super-secret",
    "admin-secret-key",
    "your_password",
    "your_username",
  ];

  for (const insecure of insecureValues) {
    if (jwtSecret.toLowerCase().includes(insecure)) {
      throw new Error(
        `JWT_SECRET contains insecure default value. Please generate a secure random secret.`
      );
    }
    if (adminJwtSecret.toLowerCase().includes(insecure)) {
      throw new Error(
        `ADMIN_JWT_SECRET contains insecure default value. Please generate a secure random secret.`
      );
    }
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI!;
  if (
    !mongoUri.startsWith("mongodb://") &&
    !mongoUri.startsWith("mongodb+srv://")
  ) {
    throw new Error("MONGODB_URI must be a valid MongoDB connection string");
  }

  // Warn about missing optional variables
  const missingOptional: string[] = [];
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      missingOptional.push(envVar);
    }
  }

  if (missingOptional.length > 0 && process.env.NODE_ENV !== "production") {
    console.warn(
      `⚠️  Optional environment variables not set:\n${missingOptional
        .map((v) => `  - ${v}`)
        .join("\n")}\n` + `Some features may not work without these.`
    );
  }

  return {
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET!,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    NODE_ENV:
      (process.env.NODE_ENV as "development" | "production" | "test") ||
      "development",
  };
}

// Validate on module load
export const env = validateEnv();

// Export helper to get env safely
export function getEnv(): Env {
  return env;
}
