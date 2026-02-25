import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';

export abstract class WorkspaceUserRepository {
  abstract findDefaultByUserId(userId: string): Promise<{
    member: WorkspaceUser;
    workspaceName: string;
  } | null>;

  abstract create(workspaceUser: WorkspaceUser): Promise<WorkspaceUser>;
  abstract findUniqueById(id: string): Promise<WorkspaceUser | null>;
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
