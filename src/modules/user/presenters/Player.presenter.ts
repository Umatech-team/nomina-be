import { User } from '../entities/User';

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
