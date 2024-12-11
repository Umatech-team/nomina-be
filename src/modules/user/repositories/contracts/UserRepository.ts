import { User } from '../../entities/User';

export abstract class UserRepository {
  abstract findUniqueById(id: number): Promise<User | null>;
  abstract create(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract findUniqueByName(name: string): Promise<User | null>;
}
