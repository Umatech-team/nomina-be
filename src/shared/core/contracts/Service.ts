import { Either } from '../errors/Either';

export abstract class Service<
  T = unknown,
  K extends Error | void = void,
  J = null,
> {
  abstract execute(props: T, ctx?: unknown): Promise<Either<K, J>>;
}
