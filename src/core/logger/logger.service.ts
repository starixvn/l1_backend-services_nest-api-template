import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

type LogLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  /**
   * Capture an exception and send it to Sentry
   * @param exception - The exception to capture
   * @param context - Additional context information
   * @param user - User information (optional)
   */
  captureException(
    exception: any,
    context?: Record<string, any>,
    user?: { id?: string; email?: string; username?: string },
  ): string {
    try {
      // Set user context if provided
      if (user) {
        Sentry.setUser(user);
      }

      // Set additional context if provided
      if (context) {
        Sentry.setContext('additional_info', context);
      }

      // Capture the exception
      const eventId = Sentry.captureException(exception);

      this.logger.error(`Exception captured by Sentry: ${eventId}`, exception?.stack);

      return eventId;
    } catch (error) {
      this.logger.error('Failed to capture exception in Sentry', error);
      return '';
    }
  }

  /**
   * Capture a message and send it to Sentry
   * @param message - The message to capture
   * @param level - Severity level
   * @param context - Additional context information
   */
  captureMessage(message: string, level: LogLevel = 'info', context?: Record<string, any>): string {
    try {
      // Set additional context if provided
      if (context) {
        Sentry.setContext('message_context', context);
      }

      const eventId = Sentry.captureMessage(message, level);

      this.logger.log(`Message captured by Sentry: ${eventId} - ${message}`);

      return eventId;
    } catch (error) {
      this.logger.error('Failed to capture message in Sentry', error);
      return '';
    }
  }

  /**
   * Add breadcrumb for debugging
   * @param message - Breadcrumb message
   * @param category - Category of the breadcrumb
   * @param level - Severity level
   * @param data - Additional data
   */
  addBreadcrumb(
    message: string,
    category = 'custom',
    level: LogLevel = 'info',
    data?: Record<string, any>,
  ): void {
    try {
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        data,
        timestamp: Date.now() / 1000,
      });
    } catch (error) {
      this.logger.error('Failed to add breadcrumb in Sentry', error);
    }
  }

  /**
   * Set user context for all subsequent events
   * @param user - User information
   */
  setUser(user: { id?: string; email?: string; username?: string }): void {
    try {
      Sentry.setUser(user);
    } catch (error) {
      this.logger.error('Failed to set user in Sentry', error);
    }
  }

  /**
   * Set tags for filtering in Sentry
   * @param tags - Key-value pairs of tags
   */
  setTags(tags: Record<string, string>): void {
    try {
      Sentry.setTags(tags);
    } catch (error) {
      this.logger.error('Failed to set tags in Sentry', error);
    }
  }

  /**
   * Set extra context information
   * @param key - Context key
   * @param context - Context data
   */
  setContext(key: string, context: Record<string, any>): void {
    try {
      Sentry.setContext(key, context);
    } catch (error) {
      this.logger.error('Failed to set context in Sentry', error);
    }
  }

  /**
   * Manually flush Sentry events (useful for serverless or short-lived processes)
   * @param timeout - Timeout in milliseconds
   */
  async flush(timeout = 2000): Promise<boolean> {
    try {
      return await Sentry.flush(timeout);
    } catch (error) {
      this.logger.error('Failed to flush Sentry events', error);
      return false;
    }
  }
}
