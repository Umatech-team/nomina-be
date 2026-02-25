import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';

export abstract class WorkspaceInviteRepository {
  abstract create(invite: WorkspaceInvite): Promise<void>;
  abstract findByCode(code: string): Promise<WorkspaceInvite | null>;
  abstract markAsUsed(id: string, usedByUserId: string): Promise<void>;
}
