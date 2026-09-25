import * as winston from 'winston';
import 'winston-daily-rotate-file';

const isProduction = process.env.NODE_ENV === 'production';

// Formato legível para o console (dev): colorido, com timestamp e contexto.
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf((info) => {
    const { timestamp, level, message, context, stack } = info as {
      timestamp: string;
      level: string;
      message: string;
      context?: string;
      stack?: string;
    };

    const ctx = context ? ` [${context}]` : '';
    const trace = stack ? `\n${stack}` : '';
    return `[${timestamp}] ${level}${ctx} ${message}${trace}`;
  }),
);

// Formato JSON para os arquivos: fácil de parsear por ferramentas depois.
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Transport de arquivo com rotação diária, todos os níveis.
const combinedFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // mantém só os últimos 14 dias
  format: fileFormat,
});

// Transport de arquivo com rotação diária, só para erros.
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  level: 'error',
  format: fileFormat,
});

export const winstonConfig: winston.LoggerOptions = {
  level: isProduction ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    combinedFileTransport,
    errorFileTransport,
  ],
};
