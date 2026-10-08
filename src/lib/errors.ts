import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "AppError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Invalid credentials.") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied.") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string = "Database service is currently unavailable. Please verify your database connection or try again later."
  ) {
    super(message, 503);
    this.name = "DatabaseError";
  }
}

/**
 * Checks whether an error originated from Prisma or underlying database connection failures.
 */
export function isDatabaseError(err: unknown): boolean {
  if (!err) return false;

  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientRustPanicError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    return true;
  }

  if (typeof err === "object") {
    const errorObj = err as Record<string, unknown>;
    const code = errorObj.code;
    if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ENOTFOUND" || code === "57P01") {
      return true;
    }

    const name = String(errorObj.name || "");
    if (name.startsWith("PrismaClient")) {
      return true;
    }

    const message = String(errorObj.message || "");
    if (
      message.includes("prisma.") ||
      message.includes("user.findUnique") ||
      message.includes("Can't reach database server") ||
      message.includes("ECONNREFUSED") ||
      message.includes("connection refused") ||
      message.includes("invocation in") ||
      message.includes("adapter-pg")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Identifies whether an error string contains sensitive technical details such as file paths,
 * bundler chunk hashes, or database invocations that should never be presented to end users.
 */
export function isTechnicalLeak(message: string): boolean {
  if (!message || typeof message !== "string") return false;
  return (
    message.includes("__TURBOPACK__") ||
    message.includes(".next") ||
    message.includes("node_modules") ||
    message.includes("invocation in") ||
    message.includes("prisma.") ||
    message.includes("SELECT ") ||
    message.includes("INSERT INTO ") ||
    message.includes("UPDATE ") ||
    message.includes("DELETE FROM ") ||
    message.includes("\n    at ") ||
    message.includes("\n  at ") ||
    message.includes(".js:") ||
    message.includes(".ts:")
  );
}

/**
 * Centralized, safe error response handler for API routes.
 * Ensures raw stack traces, database schema details, and credentials are never leaked.
 */
export function handleApiError(err: unknown, fallbackMessage: string = "An error occurred."): NextResponse {
  // 1. Zod Validation Errors
  if (err instanceof z.ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue?.message || "Invalid input data.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // 2. Custom Typed Application Errors
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode });
  }

  // 3. Prisma / Database Connection & Query Errors
  if (isDatabaseError(err)) {
    console.error("[Database Error]:", err);
    return NextResponse.json(
      { error: "Database service is currently unavailable. Please verify your database connection or try again later." },
      { status: 503 }
    );
  }

  // 4. Standard JavaScript Error
  if (err instanceof Error) {
    // Sanitize any message that leaks technical internals or stack traces
    if (isTechnicalLeak(err.message)) {
      console.error("[Internal Server Error]:", err);
      return NextResponse.json(
        { error: "An unexpected error occurred. Please try again later." },
        { status: 500 }
      );
    }

    // Map common human-readable domain error messages to appropriate HTTP status codes
    let status = 400;
    if (err.message.includes("already exists") || err.message.includes("already taken")) {
      status = 409;
    } else if (err.message.includes("Please wait") && err.message.includes("seconds")) {
      status = 429;
    } else if (err.message.includes("Invalid credentials") || err.message.includes("Invalid email or password")) {
      status = 401;
    } else if (err.message.includes("scheduled for deletion")) {
      status = 403;
    } else if (err.message.includes("not found")) {
      status = 404;
    }

    return NextResponse.json({ error: err.message }, { status });
  }

  console.error("[Unknown Error]:", err);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
