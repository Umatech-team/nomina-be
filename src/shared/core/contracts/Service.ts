import { Either } from '../errors/Either';
import { ServiceError } from '../errors/ServiceError';

export abstract class Service<
  T = unknown,
  K extends ServiceError | null = null,
  J = null,
> {
  abstract execute(props: T, ctx?: unknown): Promise<Either<K, J>>;
}
