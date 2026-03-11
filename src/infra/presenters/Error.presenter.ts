import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

/**
 *
 * @class ErrorPresenter - Present all possible application errors
 */
export class ErrorPresenter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static readonly errorMap: { [key: number]: any } = {
    [statusCode.NOT_FOUND]: NotFoundException,
    [statusCode.BAD_REQUEST]: BadRequestException,
    [statusCode.FORBIDDEN]: ForbiddenException,
    [statusCode.UNAUTHORIZED]: UnauthorizedException,
    [statusCode.CONFLICT]: ConflictException,
  };

  static toHTTP(error: ServiceError | HttpException): never {
    const Exception =
      this.errorMap[
        error instanceof HttpException ? error.getStatus() : error.statusCode
      ] || InternalServerErrorException;
    throw new Exception(error.message);
  }
}
