import { User } from '@modules/user/entities/User';

export abstract class UserRepository {
  abstract create(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findUniqueById(id: string): Promise<User | null>;
  abstract findUniqueByEmail(email: string): Promise<User | null>;
}
