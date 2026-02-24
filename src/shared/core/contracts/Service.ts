import { HttpException } from '@nestjs/common';
import { Either } from '../errors/Either';
import { ServiceError } from '../errors/ServiceError';

export abstract class Service<
  T = unknown,
  K extends HttpException | ServiceError | null = null,
  J = null,
> {
  abstract execute(props: T, ctx?: unknown): Promise<Either<K, J>>;
}
