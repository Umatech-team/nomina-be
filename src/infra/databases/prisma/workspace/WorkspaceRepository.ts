import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkspaceMapper } from './WorkspaceMapper';
import { WorkspaceUserMapper } from './WorkspaceUserMapper';

@Injectable()
export class WorkspaceRepositoryImplementation implements WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspace: Workspace): Promise<Workspace> {
    const createdWorkspace = await this.prisma.workspace.create({
      data: WorkspaceMapper.toPrisma(workspace),
    });

    return WorkspaceMapper.toEntity(createdWorkspace);
  }

  async createWithOwnerAndAccount(
    workspace: Workspace,
    owner: WorkspaceUser,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      if (owner.isDefault) {
        await tx.workspaceUser.updateMany({
          where: { userId: owner.userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const createdWorkspace = await tx.workspace.create({
        data: WorkspaceMapper.toPrisma(workspace),
      });

      owner.workspaceId = createdWorkspace.id;

      await tx.workspaceUser.create({
        data: WorkspaceUserMapper.toPrisma(owner),
      });

      await tx.account.create({
        data: {
          name: 'Carteira',
          type: 'CASH',
          balance: 0,
          workspaceId: createdWorkspace.id,
          icon: 'wallet',
        },
      });
    });
  }

  async update(workspace: Workspace): Promise<Workspace> {
    const updatedWorkspace = await this.prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        name: workspace.name,
        currency: workspace.currency,
      },
    });

    return WorkspaceMapper.toEntity(updatedWorkspace);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workspace.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      return null;
    }

    return WorkspaceMapper.toEntity(workspace);
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
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [workspaceUsers, total] = await Promise.all([
      this.prisma.workspaceUser.findMany({
        where: { userId },
        include: { workspace: true },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.workspaceUser.count({
        where: { userId },
      }),
    ]);

    const workspaces = workspaceUsers.map((wu) => ({
      workspace: WorkspaceMapper.toEntity(wu.workspace),
      role: wu.role as UserRole,
      isDefault: wu.isDefault,
    }));

    return { workspaces, total };
  }

  async addUser(workspaceUser: WorkspaceUser): Promise<WorkspaceUser> {
    const created = await this.prisma.workspaceUser.create({
      data: WorkspaceUserMapper.toPrisma(workspaceUser),
    });

    return WorkspaceUserMapper.toEntity(created);
  }

  async removeUser(id: string): Promise<void> {
    await this.prisma.workspaceUser.delete({
      where: { id },
    });
  }

  async updateUser(workspaceUser: WorkspaceUser): Promise<WorkspaceUser> {
    const updated = await this.prisma.workspaceUser.update({
      where: { id: workspaceUser.id },
      data: {
        role: workspaceUser.role,
      },
    });

    return WorkspaceUserMapper.toEntity(updated);
  }

  async findUsersByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ workspaceUsers: WorkspaceUser[]; total: number }> {
    const skip = (page - 1) * limit;

    const [workspaceUsers, total] = await Promise.all([
      this.prisma.workspaceUser.findMany({
        where: { workspaceId },
        skip,
        take: limit,
        orderBy: { joinedAt: 'asc' },
      }),
      this.prisma.workspaceUser.count({
        where: { workspaceId },
      }),
    ]);

    return {
      workspaceUsers: workspaceUsers.map(WorkspaceUserMapper.toEntity),
      total,
    };
  }

  async findUserByWorkspaceAndUserId(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceUser | null> {
    const workspaceUser = await this.prisma.workspaceUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!workspaceUser) {
      return null;
    }

    return WorkspaceUserMapper.toEntity(workspaceUser);
  }

  async findUserById(id: string): Promise<WorkspaceUser | null> {
    const workspaceUser = await this.prisma.workspaceUser.findUnique({
      where: { id },
    });

    if (!workspaceUser) {
      return null;
    }

    return WorkspaceUserMapper.toEntity(workspaceUser);
  }
}
