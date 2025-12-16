/**
 * Centralized Error Logging Utility
 * 
 * Replaces console.error/console.warn in production code
 * with proper error handling and monitoring.
 */

export type ErrorContext = {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
};

export class ErrorLogger {
  private static isDevelopment = import.meta.env.DEV;
  private static errors: Array<{ timestamp: Date; error: Error; context?: ErrorContext }> = [];

  /**
   * Log an error with context
   */
  static logError(error: unknown, context?: ErrorContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Store error for debugging
    this.errors.push({
      timestamp: new Date(),
      error: errorObj,
      context,
    });

    // In development, log to console
    if (this.isDevelopment) {
      console.error('[ErrorLogger]', {
        message: errorObj.message,
        stack: errorObj.stack,
        context,
      });
    }

    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    // this.sendToMonitoring(errorObj, context);
  }

  /**
   * Log a warning
   */
  static logWarning(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.warn('[Warning]', message, context);
    }
    
    // In production, optionally send warnings to monitoring
    // this.sendWarningToMonitoring(message, context);
  }

  /**
   * Get recent errors (for debugging)
   */
  static getRecentErrors(count: number = 10) {
    return this.errors.slice(-count);
  }

  /**
   * Clear error log
   */
  static clearErrors(): void {
    this.errors = [];
  }

  /**
   * Send to external monitoring service
   * Implement when ready to integrate Sentry, LogRocket, etc.
   */
  private static sendToMonitoring(error: Error, context?: ErrorContext): void {
    // TODO: Integrate with Sentry or similar
    // Sentry.captureException(error, { contexts: { custom: context } });
  }
}

/**
 * React Error Boundary compatible error handler
 */
export function handleComponentError(error: Error, errorInfo: React.ErrorInfo, component: string): void {
  ErrorLogger.logError(error, {
    component,
    action: 'render',
    metadata: {
      componentStack: errorInfo.componentStack,
    },
  });
}

/**
 * API call error handler
 */
export function handleApiError(error: unknown, endpoint: string, method: string = 'GET'): void {
  ErrorLogger.logError(error, {
    action: 'api_call',
    metadata: {
      endpoint,
      method,
    },
  });
}

/**
 * User action error handler
 */
export function handleUserActionError(error: unknown, action: string, userId?: string): void {
  ErrorLogger.logError(error, {
    action,
    userId,
  });
}
