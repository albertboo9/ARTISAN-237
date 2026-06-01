/**
 * Système unifié de gestion d'erreurs
 * Parse, formate et affiche les erreurs de manière professionnelle
 */

import { toast } from 'sonner';

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  status?: number;
}

export function parseError(error: unknown): AppError {
  if (error instanceof AppErrorClass) {
    return error;
  }

  if (error instanceof Error) {
    // Try to parse JSON error from API
    try {
      const parsed = JSON.parse(error.message);
      return new AppErrorClass(
        parsed.code || 'UNKNOWN_ERROR',
        parsed.message || 'Une erreur est survenue',
        parsed.details,
        parsed.status || 500,
      );
    } catch {
      // Plain error message
      return new AppErrorClass(
        'UNKNOWN_ERROR',
        error.message || 'Une erreur est survenue',
        undefined,
        500,
      );
    }
  }

  if (typeof error === 'string') {
    return new AppErrorClass('UNKNOWN_ERROR', error, undefined, 500);
  }

  return new AppErrorClass(
    'UNKNOWN_ERROR',
    'Une erreur inattendue est survenue',
    undefined,
    500,
  );
}

export class AppErrorClass extends Error {
  public code: string;
  public details?: Record<string, string[]>;
  public status: number;

  constructor(
    code: string,
    message: string,
    details?: Record<string, string[]>,
    status?: number,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.status = status || 500;
  }
}

export function showErrorToast(error: unknown): void {
  const appError = parseError(error);

  toast.error(appError.message, {
    description: appError.details
      ? Object.values(appError.details).flat().join(', ')
      : undefined,
    duration: 5000,
  });
}

export function showSuccessToast(message: string): void {
  toast.success(message, {
    duration: 4000,
  });
}

// Validation error formatter (from Zod or class-validator)
export function formatValidationErrors(
  errors: Record<string, string[]>,
): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n');
}