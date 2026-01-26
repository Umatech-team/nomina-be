import { WorkspaceUser } from '../entities/WorkspaceUser';

export class WorkspaceUserPresenter {
  static toHTTP(workspaceUser: WorkspaceUser) {
    return {
      id: workspaceUser.id,
      workspaceId: workspaceUser.workspaceId,
      userId: workspaceUser.userId,
      role: workspaceUser.role,
      joinedAt: workspaceUser.joinedAt,
    };
  }
}
