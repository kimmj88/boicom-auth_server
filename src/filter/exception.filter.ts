import { Request, Response } from 'express';
import {
  ErrorCodeList,
  ErrorCodeToHttpStatus,
} from '@common/code/error/code.error.database';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  Logger,
  LoggerService,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const code = exception?.response?.code || exception.code || 'UNKNOWN_ERROR';

    const status =
      ErrorCodeToHttpStatus[code] !== undefined
        ? ErrorCodeToHttpStatus[code]
        : exception?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    const domain = request.route?.path?.split('/')[1] || 'unknown';

    const message =
      ErrorCodeList[code]?.(domain) || exception.message || 'Unexpected error';

    this.logger.error(
      `#URL=${request.originalUrl}|#MESSAGE=${message}|#CONSTRAINT=${exception?.constraint}`,
    );

    response.status(status).json({
      message,
    });
  }
}
