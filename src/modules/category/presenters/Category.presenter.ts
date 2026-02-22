import { Category } from '../entities/Category';

export class CategoryPresenter {
  static toHTTP(category: Category) {
    return {
      id: category.id,
      workspaceId: category.workspaceId,
      name: category.name,
      type: category.type,
      parentId: category.parentId,
      isSubcategory: category.isSubcategory,
      isSystemCategory: category.isSystemCategory,
    };
  }
}
