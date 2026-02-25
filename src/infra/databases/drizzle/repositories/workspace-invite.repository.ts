import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import * as schema from '@infra/databases/drizzle/schema';
import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';
import { WorkspaceInviteRepository } from '@modules/workspace/repositories/contracts/WorkspaceInviteRepository';
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { WorkspaceInviteMapper } from '../mappers/workspace-invite.mapper';

@Injectable()
export class WorkspaceInviteRepositoryImplementation
  implements WorkspaceInviteRepository
{
  constructor(private readonly drizzle: DrizzleService) {}

  async create(invite: WorkspaceInvite): Promise<void> {
    await this.drizzle.db
      .insert(schema.workspaceInvites)
      .values(WorkspaceInviteMapper.toDatabase(invite));
  }

  async findByCode(code: string): Promise<WorkspaceInvite | null> {
    const [rawInvite] = await this.drizzle.db
      .select()
      .from(schema.workspaceInvites)
      .where(eq(schema.workspaceInvites.code, code))
      .limit(1);

    if (!rawInvite) return null;
    return WorkspaceInviteMapper.toDomain(rawInvite);
  }

  async markAsUsed(id: string, usedByUserId: string): Promise<void> {
    await this.drizzle.db
      .update(schema.workspaceInvites)
      .set({
        usedAt: new Date(),
        usedBy: usedByUserId,
      })
      .where(eq(schema.workspaceInvites.id, id));
  }
}
