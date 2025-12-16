import pino from 'pino';
import pinoHttp, { HttpLogger } from 'pino-http';
import { IncomingMessage, ServerResponse } from 'http';
import { env } from './env';

const isDevelopment = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

export const httpLogger: HttpLogger = pinoHttp({
  logger,
  customLogLevel: (req: IncomingMessage, res: ServerResponse, err?: Error) => {
    const statusCode = res.statusCode || 500;
    if (statusCode >= 400 && statusCode < 500) {
      return 'warn';
    } else if (statusCode >= 500 || err) {
      return 'error';
    }
    return isDevelopment ? 'debug' : 'info';
  },
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
    const statusCode = res.statusCode || 200;
    return `${statusCode} - ${req.method} ${req.url}`;
  },
  customErrorMessage: (req: IncomingMessage, res: ServerResponse, err: Error) => {
    const statusCode = res.statusCode || 500;
    return `${statusCode} - ${req.method} ${req.url} - ${err.message}`;
  },
});
