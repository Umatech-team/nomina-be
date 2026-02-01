import { TransactionType } from '@constants/enums';
import { Category } from '@modules/category/entities/Category';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CategoryMapper } from './CategoryMapper';

@Injectable()
export class CategoryRepositoryImplementation implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category): Promise<Category> {
    const data = CategoryMapper.toPrisma(category);

    const createdCategory = await this.prisma.category.create({
      data,
    });

    return CategoryMapper.toEntity(createdCategory);
  }

  async update(category: Category): Promise<Category> {
    const data = CategoryMapper.toPrisma(category);

    const updatedCategory = await this.prisma.category.update({
      where: { id: category.id },
      data,
    });

    return CategoryMapper.toEntity(updatedCategory);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return null;
    }

    return CategoryMapper.toEntity(category);
  }

  async findByNameAndWorkspaceId(
    name: string,
    workspaceId: string,
  ): Promise<Category | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        name,
        workspaceId,
      },
    });

    if (!category) {
      return null;
    }

    return CategoryMapper.toEntity(category);
  }

  async findByNameTypeAndWorkspace(
    name: string,
    type: TransactionType,
    workspaceId: string,
    parentId?: string | null,
  ): Promise<Category | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        name,
        type,
        workspaceId,
        parentId: parentId === undefined ? undefined : parentId,
      },
    });

    if (!category) {
      return null;
    }

    return CategoryMapper.toEntity(category);
  }

  async findManyByWorkspaceId(
    workspaceId: string,
    filters?: {
      type?: TransactionType;
      parentId?: string | null;
    },
    page: number = 1,
    limit: number = 50,
  ): Promise<{ categories: Category[]; total: number }> {
    const where: any = {
      workspaceId,
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      categories: categories.map(CategoryMapper.toEntity),
      total,
    };
  }

  async countChildren(categoryId: string): Promise<number> {
    return await this.prisma.category.count({
      where: { parentId: categoryId },
    });
  }

  async countTransactions(categoryId: string): Promise<number> {
    return await this.prisma.transaction.count({
      where: { categoryId },
    });
  }

  async reassignChildren(
    categoryId: string,
    newParentId: string | null,
  ): Promise<void> {
    await this.prisma.category.updateMany({
      where: { parentId: categoryId },
      data: { parentId: newParentId },
    });
  }
}
