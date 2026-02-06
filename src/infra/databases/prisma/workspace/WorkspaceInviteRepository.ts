import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';
import { WorkspaceInviteRepository } from '@modules/workspace/repositories/contracts/WorkspaceInviteRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkspaceInviteMapper } from './WorkspaceInviteMapper';

@Injectable()
export class WorkspaceInviteRepositoryImplementation
  implements WorkspaceInviteRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findDefaultByInviteCode(
    inviteCode: string,
  ): Promise<WorkspaceInvite | null> {
    const raw = await this.prisma.workspaceInvite.findFirst({
      where: { code: inviteCode },
    });

    if (!raw) return null;

    return WorkspaceInviteMapper.toEntity(raw);
  }

  async create(workspaceInvite: WorkspaceInvite): Promise<WorkspaceInvite> {
    const createdWorkspaceInvite = await this.prisma.workspaceInvite.create({
      data: WorkspaceInviteMapper.toPrisma(workspaceInvite),
    });

    return WorkspaceInviteMapper.toEntity(createdWorkspaceInvite);
  }
}
