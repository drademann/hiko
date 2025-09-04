import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Logger, LoggerToken } from './logger.service';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const logger = Container.get<Logger>(LoggerToken);
  const startTime = Date.now();

  const requestLogger = logger.child({
    requestId: generateRequestId(),
    method: req.method,
    url: req.url,
  });

  requestLogger.info('request started');

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    requestLogger.info('request completed', {
      statusCode: res.statusCode,
      duration: `${duration} ms`,
      responseBody: JSON.parse(data),
    });
    return originalSend.call(this, data);
  };

  res.on('error', (error) => {
    const duration = Date.now() - startTime;
    requestLogger.error('Request failed', {
      error: error.message,
      duration: `${duration} ms`,
      statusCode: res.statusCode,
    });
  });

  next();
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
