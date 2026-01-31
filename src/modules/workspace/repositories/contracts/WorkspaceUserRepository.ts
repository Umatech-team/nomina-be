import { WorkspaceMemberWithDetails } from '@infra/databases/prisma/workspace/WorkspaceUserMapper';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';

export abstract class WorkspaceUserRepository {
  abstract findDefaultByUserId(
    userId: string,
  ): Promise<WorkspaceMemberWithDetails | null>;

  abstract create(workspaceUser: WorkspaceUser): Promise<WorkspaceUser>;
  // abstract update(workspace: Workspace): Promise<void>;
  // abstract delete(id: string): Promise<void>;
  // abstract findUniqueById(id: string): Promise<Workspace | null>;
}
