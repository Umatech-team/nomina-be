import { User } from '@modules/user/entities/User';
import { Prisma, User as UserPrisma } from '@prisma/client';

export class UserMapper {
  static toEntity(raw: UserPrisma): User {
    return new User(
      {
        name: raw.name,
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(entity: User): Prisma.UserUncheckedCreateInput {
    return {
      name: entity.name,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt as Date,
    };
  }
}
