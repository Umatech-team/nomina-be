import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';

export abstract class WorkspaceInviteRepository {
  abstract findDefaultByInviteCode(
    inviteCode: string,
  ): Promise<WorkspaceInvite | null>;

  abstract create(workspaceInvite: WorkspaceInvite): Promise<WorkspaceInvite>;

  abstract update(workspaceInvite: WorkspaceInvite): Promise<WorkspaceInvite>;
  // abstract delete(id: string): Promise<void>;
  // abstract findUniqueById(id: string): Promise<Workspace | null>;
}
