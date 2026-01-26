import { Category } from '../entities/Category';

export class CategoryPresenter {
  static toHTTP(category: Category) {
    return {
      id: category.id,
      workspaceId: category.workspaceId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      parentId: category.parentId,
      isSubcategory: category.isSubcategory,
    };
  }
}
