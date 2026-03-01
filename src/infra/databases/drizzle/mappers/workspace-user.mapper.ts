import { UserRole } from '@constants/enums';
import * as schema from '@infra/databases/drizzle/schema';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';

type WorkspaceUserDrizzle = typeof schema.workspaceUsers.$inferSelect;
type WorkspaceUserDrizzleInsert = typeof schema.workspaceUsers.$inferInsert;

export class WorkspaceUserMapper {
  static toDomain(raw: WorkspaceUserDrizzle): WorkspaceUser {
    const result = WorkspaceUser.create(
      {
        userId: raw.userId,
        workspaceId: raw.workspaceId,
        joinedAt: raw.joinedAt,
        role: raw.role as UserRole,
        isDefault: raw.isDefault,
      },
      raw.id,
    );

    if (result.isLeft()) {
      throw result.value;
    }

    return result.value;
  }

  static toDatabase(entity: WorkspaceUser): WorkspaceUserDrizzleInsert {
    return {
      id: entity.id,
      userId: entity.userId,
      workspaceId: entity.workspaceId,
      role: entity.role,
      isDefault: entity.isDefault,
      joinedAt: entity.joinedAt,
    };
  }
}
