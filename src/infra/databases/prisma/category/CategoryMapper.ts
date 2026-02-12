import { TransactionType } from '@constants/enums';
import { Category } from '@modules/category/entities/Category';
import { Category as CategoryPrisma, Prisma } from '@prisma/client';

export class CategoryMapper {
  static toEntity(raw: CategoryPrisma): Category {
    return new Category(
      {
        workspaceId: raw.workspaceId,
        name: raw.name,
        icon: raw.icon,
        color: raw.color,
        type: raw.type as TransactionType,
        parentId: raw.parentId,
        isSystemCategory: raw.isSystemCategory,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Category): Prisma.CategoryUncheckedCreateInput {
    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      name: entity.name,
      icon: entity.icon,
      color: entity.color,
      type: entity.type,
      parentId: entity.parentId,
      isSystemCategory: entity.isSystemCategory,
    };
  }
}
