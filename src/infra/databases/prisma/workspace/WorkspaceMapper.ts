import { Workspace } from '@modules/workspace/entities/Workspace';
import { Prisma, Workspace as WorkspacePrisma } from '@prisma/client';

export class WorkspaceMapper {
  static toEntity(raw: WorkspacePrisma): Workspace {
    const createdWorkspace = Workspace.create(
      {
        name: raw.name,
        currency: raw.currency,
        createdAt: raw.createdAt,
      },
      raw.id,
    );

    if (createdWorkspace.isLeft()) {
      throw new Error('Erro ao converter WorkspacePrisma para Workspace');
    }

    return createdWorkspace.value;
  }

  static toPrisma(entity: Workspace): Prisma.WorkspaceUncheckedCreateInput {
    return {
      id: entity.id,
      name: entity.name,
      currency: entity.currency,
      createdAt: entity.createdAt,
    };
  }
}
