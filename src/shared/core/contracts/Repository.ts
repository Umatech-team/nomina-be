export abstract class Repository<T, K = unknown> {
  abstract create(data: T, ctx?: K): Promise<void>;
  abstract findById(id: number, ctx?: K): Promise<T | null>;
  abstract findAll(ctx?: K): Promise<T[]>;
  abstract save(data: T, ctx?: K): Promise<void>;
  abstract delete(id: number, ctx?: K): Promise<void>;
}

export abstract class RepositoryMapper<T, K, J = K> {
  abstract toDomain(raw: K): T;
  abstract toPersistence(entity: T): J;
}
