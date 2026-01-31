import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  WorkspaceMemberWithDetails,
  WorkspaceUserMapper,
} from './WorkspaceUserMapper';

@Injectable()
export class WorkspaceUserRepositoryImplementation
  implements WorkspaceUserRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findDefaultByUserId(
    userId: string,
  ): Promise<WorkspaceMemberWithDetails | null> {
    const raw = await this.prisma.workspaceUser.findFirst({
      where: { userId, isDefault: true },
      include: {
        workspace: {
          select: { id: true, name: true },
        },
      },
    });

    if (!raw) return null;

    return WorkspaceUserMapper.toDomainWithWorkspace(raw);
  }

  async create(workspaceUser: WorkspaceUser): Promise<WorkspaceUser> {
    const createdWorkspaceUser = await this.prisma.workspaceUser.create({
      data: WorkspaceUserMapper.toPrisma(workspaceUser),
    });

    return WorkspaceUserMapper.toEntity(createdWorkspaceUser);
  }
}
