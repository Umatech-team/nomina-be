import { UserRole } from '@constants/enums';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { Prisma, WorkspaceUser as WorkspaceUserPrisma } from '@prisma/client';

type PrismaMemberWithWorkspace = WorkspaceUserPrisma & {
  workspace: {
    id: string;
    name: string;
  };
};

export type WorkspaceMemberWithDetails = {
  member: WorkspaceUser;
  workspaceName: string;
};

export class WorkspaceUserMapper {
  static toEntity(raw: WorkspaceUserPrisma): WorkspaceUser {
    const result = WorkspaceUser.create(
      {
        workspaceId: raw.workspaceId,
        userId: raw.userId,
        role: raw.role as UserRole,
        joinedAt: raw.joinedAt,
        isDefault: raw.isDefault,
      },
      raw.id,
    );

    if (result.isLeft()) {
      throw result.value;
    }

    return result.value;
  }

  static toDomainWithWorkspace(
    raw: PrismaMemberWithWorkspace,
  ): WorkspaceMemberWithDetails {
    const entity = this.toEntity(raw);

    return {
      member: entity,
      workspaceName: raw.workspace.name,
    };
  }

  static toPrisma(
    entity: WorkspaceUser,
  ): Prisma.WorkspaceUserUncheckedCreateInput {
    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      userId: entity.userId,
      role: entity.role,
      joinedAt: entity.joinedAt,
      isDefault: entity.isDefault,
    };
  }
}
