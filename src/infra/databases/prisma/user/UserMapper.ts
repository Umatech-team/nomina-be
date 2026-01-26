import { User } from '@modules/user/entities/User';
import { Prisma, User as UserPrisma } from '@prisma/client';

export class UserMapper {
  static toEntity(raw: UserPrisma): User {
    return new User(
      {
        id: raw.id,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        passwordHash: raw.passwordHash,
        avatarUrl: raw.avatarUrl,
      },
      raw.id,
    );
  }

  static toPrisma(entity: User): Prisma.UserUncheckedCreateInput {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt as Date,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      passwordHash: entity.passwordHash,
      avatarUrl: entity.avatarUrl,
    };
  }
}
