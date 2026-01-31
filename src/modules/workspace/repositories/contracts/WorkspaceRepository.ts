import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';

export abstract class WorkspaceRepository {
  abstract create(workspace: Workspace): Promise<Workspace>;
  abstract createWithOwnerAndAccount(
    workspace: Workspace,
    owner: WorkspaceUser,
  ): Promise<void>;
  // abstract update(workspace: Workspace): Promise<void>;
  // abstract delete(id: string): Promise<void>;
  // abstract findUniqueById(id: string): Promise<Workspace | null>;
}
