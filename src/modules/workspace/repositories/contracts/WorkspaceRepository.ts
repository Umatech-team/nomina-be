import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';

export abstract class WorkspaceRepository {
  abstract create(workspace: Workspace): Promise<Workspace>;
  abstract createWithOwnerAndAccount(
    workspace: Workspace,
    owner: WorkspaceUser,
  ): Promise<void>;

  abstract update(workspace: Workspace): Promise<Workspace>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<Workspace | null>;
  abstract findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    workspaces: Array<{
      workspace: Workspace;
      role: UserRole;
      isDefault: boolean;
    }>;
    total: number;
  }>;

  abstract addUser(workspaceUser: WorkspaceUser): Promise<WorkspaceUser>;
  abstract removeUser(id: string): Promise<void>;
  abstract updateUser(workspaceUser: WorkspaceUser): Promise<WorkspaceUser>;
  abstract findUsersByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ workspaceUsers: WorkspaceUser[]; total: number }>;

  abstract findUserByWorkspaceAndUserId(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceUser | null>;

  abstract findUserById(id: string): Promise<WorkspaceUser | null>;
}
