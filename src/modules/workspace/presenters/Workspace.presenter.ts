import { Workspace } from '../entities/Workspace';

export class WorkspacePresenter {
  static toHTTP(workspace: Workspace) {
    return {
      id: workspace.id,
      name: workspace.name,
      currency: workspace.currency,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
    };
  }
}
