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

      await tx.workspace.create({
        data: WorkspaceMapper.toPrisma(workspace),
      });

      await tx.workspaceUser.create({
        data: WorkspaceUserMapper.toPrisma(owner),
      });

      await tx.account.create({
        data: {
          name: 'Carteira',
          type: 'CASH',
          balance: 0,
          workspaceId: workspace.id,
          icon: 'wallet',
        },
      });
    });
  }
}
