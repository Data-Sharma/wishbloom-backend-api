import * as functions from "firebase-functions/v1";

/**
 * Logger utility for structured logging
 */
export class Logger {
  /**
   * Log info message
   */
  static info(message: string, data?: any): void {
    functions.logger.info(message, data);
  }

  /**
   * Log warning message
   */
  static warn(message: string, data?: any): void {
    functions.logger.warn(message, data);
  }

  /**
   * Log error message
   */
  static error(message: string, error?: any): void {
    functions.logger.error(message, {
      error: error?.message || error,
      stack: error?.stack,
    });
  }

  /**
   * Log debug message
   */
  static debug(message: string, data?: any): void {
    functions.logger.debug(message, data);
  }

  /**
   * Log with custom severity
   */
  static log(severity: "info" | "warn" | "error" | "debug", message: string, data?: any): void {
    switch (severity) {
    case "info":
      this.info(message, data);
      break;
    case "warn":
      this.warn(message, data);
      break;
    case "error":
      this.error(message, data);
      break;
    case "debug":
      this.debug(message, data);
      break;
    }
  }
}

// Export singleton instance
export const logger = Logger;
