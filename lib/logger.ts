/**
 * Error Logger
 * Centralized error logging with support for external services
 */

interface ErrorLog {
  timestamp: Date
  level: "error" | "warn" | "info"
  message: string
  context?: Record<string, unknown>
  stack?: string
  userId?: string
  requestId?: string
}

/**
 * Log error to console and external service (if configured)
 */
export function logError(
  error: Error | unknown,
  context?: Record<string, unknown>
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date(),
    level: "error",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  }

  // Console log (development)
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      message: errorLog.message,
      context: errorLog.context,
      stack: errorLog.stack,
    })
  } else {
    // Production - only log message
    console.error("Error:", errorLog.message, errorLog.context)
  }

  // TODO: Send to external logging service (Sentry, LogRocket, etc.)
  // Example:
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { contexts: { custom: context } })
  // }
}

/**
 * Log warning
 */
export function logWarning(
  message: string,
  context?: Record<string, unknown>
): void {
  const warningLog: ErrorLog = {
    timestamp: new Date(),
    level: "warn",
    message,
    context,
  }

  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️  Warning:", message, context)
  } else {
    console.warn("Warning:", message, context)
  }
}

/**
 * Log info
 */
export function logInfo(
  message: string,
  context?: Record<string, unknown>
): void {
  const infoLog: ErrorLog = {
    timestamp: new Date(),
    level: "info",
    message,
    context,
  }

  if (process.env.NODE_ENV === "development") {
    console.info("ℹ️  Info:", message, context)
  }
}

/**
 * Sanitize error for client response
 * Never expose internal details in production
 */
export function sanitizeError(error: Error | unknown): {
  error: string
  details?: string
} {
  const isDevelopment = process.env.NODE_ENV === "development"

  if (error instanceof Error) {
    return {
      error: isDevelopment ? error.message : "An error occurred",
      details: isDevelopment ? error.stack : undefined,
    }
  }

  return {
    error: isDevelopment ? String(error) : "An error occurred",
  }
}

/**
 * Create error response with proper logging
 */
export function createErrorResponse(
  error: Error | unknown,
  context?: Record<string, unknown>
): { error: string; details?: string } {
  logError(error, context)
  return sanitizeError(error)
}
