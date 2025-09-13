import * as winston from 'winston';

type LogMetadata = string | number | boolean | object | null | undefined;

export interface Logger {
  error(message: string, meta?: LogMetadata): void;
  warn(message: string, meta?: LogMetadata): void;
  info(message: string, meta?: LogMetadata): void;
  debug(message: string, meta?: LogMetadata): void;
  child(context: { [key: string]: LogMetadata }): Logger;
}

export function createLogger(context?: { [key: string]: LogMetadata }): Logger {
  const logger = WinstonLogger.getInstance();
  return context ? logger.child(context) : logger;
}

class WinstonLogger implements Logger {
  private static instance: WinstonLogger;
  private readonly winston: winston.Logger;

  constructor() {
    const isDevelopment = process.env['NODE_ENV'] === 'development';

    this.winston = winston.createLogger({
      level: process.env['LOG_LEVEL'] || (isDevelopment ? 'debug' : 'info'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'hiko-backend' },
      transports: [
        new winston.transports.Console({
          format: isDevelopment
            ? winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                  return `${timestamp} [${level}]: ${message} ${metaStr}`;
                }),
              )
            : winston.format.json(),
        }),
      ],
    });

    if (!isDevelopment) {
      this.winston.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      );

      this.winston.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      );
    }
  }

  public static getInstance(): WinstonLogger {
    if (!WinstonLogger.instance) {
      WinstonLogger.instance = new WinstonLogger();
    }
    return WinstonLogger.instance;
  }

  error(message: string, meta?: LogMetadata): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: LogMetadata): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: LogMetadata): void {
    this.winston.info(message, meta);
  }

  debug(message: string, meta?: LogMetadata): void {
    this.winston.debug(message, meta);
  }

  child(context: { [key: string]: LogMetadata }): Logger {
    return new ChildLogger(this.winston.child(context));
  }
}

class ChildLogger implements Logger {
  constructor(private winston: winston.Logger) {}

  error(message: string, meta?: LogMetadata): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: LogMetadata): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: LogMetadata): void {
    this.winston.info(message, meta);
  }

  debug(message: string, meta?: LogMetadata): void {
    this.winston.debug(message, meta);
  }

  child(context: { [key: string]: LogMetadata }): Logger {
    return new ChildLogger(this.winston.child(context));
  }
}
