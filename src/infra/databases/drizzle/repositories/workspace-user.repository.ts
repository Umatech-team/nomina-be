import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { WorkspaceMapper } from '../mappers/workspace.mapper';
import * as schema from '../schema';

@Injectable()
export class WorkspaceUserRepositoryImplementation
  implements WorkspaceUserRepository
{
  constructor(private readonly drizzle: DrizzleService) {}
  findDefaultByUserId(
    userId: string,
  ): Promise<{ member: WorkspaceUser; workspaceName: string } | null> {
    throw new Error('Method not implemented.');
  }

  create(workspaceUser: WorkspaceUser): Promise<WorkspaceUser> {
    throw new Error('Method not implemented.');
  }

  findUniqueById(id: string): Promise<WorkspaceUser | null> {
    throw new Error('Method not implemented.');
  }

  async addUser(workspaceUser: WorkspaceUser): Promise<WorkspaceUser> {
    const [createdWorkspaceUser] = await this.drizzle.db
      .insert(schema.workspaceUsers)
      .values({
        id: workspaceUser.id,
        userId: workspaceUser.userId,
        workspaceId: workspaceUser.workspaceId,
        role: workspaceUser.role,
        isDefault: workspaceUser.isDefault,
        joinedAt: workspaceUser.joinedAt,
      });

    return WorkspaceMapper.toDomain(createdWorkspaceUser);
  }

  async removeUser(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async updateUser(workspaceUser: WorkspaceUser): Promise<WorkspaceUser> {
    throw new Error('Method not implemented.');
  }

  async findUsersByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ workspaceUsers: WorkspaceUser[]; total: number }> {
    throw new Error('Method not implemented.');
  }

  async findUserByWorkspaceAndUserId(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceUser | null> {
    throw new Error('Method not implemented.');
  }

  async findUserById(id: string): Promise<WorkspaceUser | null> {
    throw new Error('Method not implemented.');
  }
}
