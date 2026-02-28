import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';

export abstract class WorkspaceInviteRepository {
  abstract create(invite: WorkspaceInvite): Promise<WorkspaceInvite>;
  abstract findByCode(code: string): Promise<WorkspaceInvite | null>;
  abstract markAsUsed(id: string, usedByUserId: string): Promise<void>;
}
