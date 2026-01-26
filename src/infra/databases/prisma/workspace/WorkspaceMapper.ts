import { Workspace } from '@modules/workspace/entities/Workspace';
import { Prisma, Workspace as WorkspacePrisma } from '@prisma/client';

export class WorkspaceMapper {
  static toEntity(raw: WorkspacePrisma): Workspace {
    return new Workspace(
      {
        name: raw.name,
        currency: raw.currency,
        ownerId: raw.ownerId,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Workspace): Prisma.WorkspaceUncheckedCreateInput {
    return {
      id: entity.id,
      name: entity.name,
      currency: entity.currency,
      ownerId: entity.ownerId,
      createdAt: entity.createdAt,
    };
  }
}
