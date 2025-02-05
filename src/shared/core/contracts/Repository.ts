export abstract class Repository<T> {
  abstract create(data: T): Promise<void>;
  abstract findUniqueById(id: number): Promise<T | null>;
  abstract update(data: T): Promise<void>;
  abstract delete(id: number): Promise<void>;
}

export abstract class RepositoryMapper<T, K, J = K> {
  abstract toDomain(raw: K): T;
  abstract toPersistence(entity: T): J;
}
