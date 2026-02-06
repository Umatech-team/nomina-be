import { UserRole } from '@constants/enums';
import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';
import {
  Prisma,
  WorkspaceInvite as WorkspaceInvitePrisma,
} from '@prisma/client';

export class WorkspaceInviteMapper {
  static toEntity(raw: WorkspaceInvitePrisma): WorkspaceInvite {
    const result = WorkspaceInvite.create({
      code: raw.code,
      workspaceId: raw.workspaceId,
      role: raw.role as UserRole,
      createdBy: raw.createdBy,
      expiresAt: raw.expiresAt,
      usedAt: raw.usedAt ?? null,
      usedBy: raw.usedBy ?? null,
    });

    if (result.isLeft()) {
      throw result.value;
    }

    return result.value;
  }

  static toPrisma(
    entity: WorkspaceInvite,
  ): Prisma.WorkspaceInviteUncheckedCreateInput {
    return {
      id: entity.id,
      code: entity.code,
      workspaceId: entity.workspaceId,
      role: entity.role,
      createdBy: entity.createdBy,
      expiresAt: entity.expiresAt,
      usedAt: entity.usedAt ?? null,
      usedBy: entity.usedBy ?? null,
    };
  }
}
