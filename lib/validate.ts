import { ZodError, type ZodSchema } from "zod"
import { NextResponse } from "next/server"

export function validateData<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))
      
      return {
        success: false,
        error: NextResponse.json(
          {
            error: "Validation failed",
            details: formattedErrors,
          },
          { status: 400 }
        ),
      }
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      ),
    }
  }
}

/**
 * Async version for use with NextRequest
 */
export async function validateRequestBody<T>(schema: ZodSchema<T>, request: Request): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json()
    return validateData(schema, body)
  } catch (error) {
    return {
      success: false,
      error: NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      ),
    }
  }
}
