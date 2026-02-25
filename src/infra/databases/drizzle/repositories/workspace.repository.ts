import { AccountType, UserRole } from '@constants/enums';
import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { WorkspaceMapper } from '../mappers/workspace.mapper';
import * as schema from '../schema';

@Injectable()
export class WorkspaceRepositoryImplementation implements WorkspaceRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  async create(workspace: Workspace): Promise<Workspace> {
    const [createdWorkspace] = await this.drizzle.db
      .insert(schema.workspaces)
      .values({
        id: workspace.id,
        name: workspace.name,
      });

    return WorkspaceMapper.toDomain(createdWorkspace);
  }

  async createWithOwnerAndAccount(
    workspace: Workspace,
    owner: WorkspaceUser,
  ): Promise<void> {
    await this.drizzle.db.transaction(async (tx) => {
      if (owner.isDefault) {
        await tx
          .update(schema.workspaceUsers)
          .set({ isDefault: false })
          .where(
            and(
              eq(schema.workspaceUsers.userId, owner.userId),
              eq(schema.workspaceUsers.isDefault, true),
            ),
          );
      }

      await tx.insert(schema.workspaces).values({
        id: workspace.id,
        name: workspace.name,
      });

      await tx.insert(schema.workspaceUsers).values({
        id: owner.id,
        userId: owner.userId,
        workspaceId: workspace.id,
        role: owner.role,
        isDefault: owner.isDefault,
        joinedAt: owner.joinedAt,
      });

      await tx.insert(schema.accounts).values({
        workspaceId: workspace.id,
        name: 'Carteira',
        type: AccountType.CASH,
        balance: 0,
      });
    });
  }

  async update(workspace: Workspace): Promise<Workspace> {
    const [updatedWorkspace] = await this.drizzle.db
      .update(schema.workspaces)
      .set({
        name: workspace.name,
      })
      .where(eq(schema.workspaces.id, workspace.id));

    return WorkspaceMapper.toDomain(updatedWorkspace);
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db
      .delete(schema.workspaces)
      .where(eq(schema.workspaces.id, id));
  }

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await this.drizzle.db
      .select()
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, id))
      .limit(1);

    return workspace.length ? WorkspaceMapper.toDomain(workspace[0]) : null;
  }

  async findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    workspaces: Array<{
      workspace: Workspace;
      role: UserRole;
      isDefault: boolean;
    }>;
  }> {
    const skip = (page - 1) * limit;

    const workspaceUsers = await this.drizzle.db
      .select()
      .from(schema.workspaceUsers)
      .where(
        and(
          eq(schema.workspaceUsers.userId, userId),
          eq(schema.workspaceUsers.role, UserRole.OWNER),
        ),
      )
      .limit(limit)
      .offset(skip);

    return {
      workspaces: await Promise.all(
        workspaceUsers.map(async (wu) => {
          const workspace = await this.drizzle.db
            .select()
            .from(schema.workspaces)
            .where(eq(schema.workspaces.id, wu.workspaceId))
            .limit(1);

          return {
            workspace: WorkspaceMapper.toDomain(workspace[0]),
            role: wu.role as UserRole,
            isDefault: wu.isDefault,
          };
        }),
      ),
    };
  }
}
