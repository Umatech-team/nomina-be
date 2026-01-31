import { Category } from '@modules/category/entities/Category';

export abstract class CategoryRepository {
  abstract create(category: Category): Promise<Category>;
  // abstract update(category: Category): Promise<void>;
  // abstract delete(id: string): Promise<void>;
  // abstract findUniqueById(id: string): Promise<Category | null>;
  abstract findByNameAndWorkspaceId(
    name: string,
    workspaceId: string,
  ): Promise<Category | null>;
}
