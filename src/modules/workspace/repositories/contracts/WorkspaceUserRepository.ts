import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';

export abstract class WorkspaceUserRepository {
  abstract findDefaultWorkspaceByUserId(userId: string): Promise<{
    user: WorkspaceUser;
    workspaceName: string;
  } | null>;

  abstract findOwnerByWorkspaceId(
    workspaceId: string,
  ): Promise<WorkspaceUser | null>;

  abstract countByWorkspaceId(workspaceId: string): Promise<number>;

  abstract addUserToWorkspace(
    workspaceUser: WorkspaceUser,
  ): Promise<WorkspaceUser>;

  abstract removeUserFromWorkspace(id: string): Promise<void>;

  abstract updateUser(workspaceUser: WorkspaceUser): Promise<WorkspaceUser>;

  abstract findMembershipById(id: string): Promise<WorkspaceUser | null>;

  abstract findUsersByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ workspaceUsers: WorkspaceUser[]; total: number }>;

  abstract findUserByWorkspaceAndUserId(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceUser | null>;
}
