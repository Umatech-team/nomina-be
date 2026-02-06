import { WorkspaceInvite } from '../entities/WorkspaceInvite';

export class WorkspaceInvitePresenter {
  static toHTTP(workspaceInvite: WorkspaceInvite) {
    return {
      createdBy: workspaceInvite.createdBy,
      code: workspaceInvite.code,
      expiresAt: workspaceInvite.expiresAt,
    };
  }
}
