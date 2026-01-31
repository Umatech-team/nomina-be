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
}
