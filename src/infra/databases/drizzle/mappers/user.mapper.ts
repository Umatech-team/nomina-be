import * as schema from '@infra/databases/drizzle/schema';
import { User } from '@modules/user/entities/User';

type UserDrizzle = typeof schema.users.$inferSelect;
type UserDrizzleInsert = typeof schema.users.$inferInsert;

export class UserMapper {
  static toDomain(raw: UserDrizzle): User {
    const result = User.create(
      {
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

    if (result.isLeft()) {
      throw result.value;
    }

    return result.value;
  }

  static toDatabase(entity: User): UserDrizzleInsert {
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
