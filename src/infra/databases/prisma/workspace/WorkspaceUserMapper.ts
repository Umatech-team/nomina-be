import { MemberRole } from '@constants/enums';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import {
  Prisma,
  WorkspaceMember as WorkspaceUserPrisma,
} from '@prisma/client';

export class WorkspaceUserMapper {
  static toEntity(raw: WorkspaceUserPrisma): WorkspaceUser {
    return new WorkspaceUser(
      {
        workspaceId: raw.workspaceId,
        userId: raw.userId,
        role: raw.role as MemberRole,
        joinedAt: raw.joinedAt,
      },
      raw.id,
    );
  }

  static toPrisma(
    entity: WorkspaceUser,
  ): Prisma.WorkspaceMemberUncheckedCreateInput {
    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      userId: entity.userId,
      role: entity.role,
      joinedAt: entity.joinedAt,
    };
  }
}
