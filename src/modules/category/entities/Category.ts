import { TransactionType } from '@constants/enums';
import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';
import {
  InvalidCategoryNameError,
  InvalidCategoryTypeError,
  InvalidParentCategoryError,
  SystemCategoryModificationError,
} from '../errors';

export interface CategoryProps {
  workspaceId: string | null;
  name: string;
  type: TransactionType;
  parentId: string | null;
  isSystemCategory: boolean;
}

export class Category extends Entity<CategoryProps> {
  private constructor(props: CategoryProps, id?: string) {
    super(props, id);
  }

  static create(props: CategoryProps, id?: string): Either<Error, Category> {
    if (!props.name || props.name.trim() === '') {
      return left(new InvalidCategoryNameError());
    }

    if (!props.type) {
      return left(new InvalidCategoryTypeError());
    }

    if (props.parentId === '') {
      return left(
        new InvalidParentCategoryError(
          'O ID da categoria pai não pode ser vazio.',
        ),
      );
    }

    if (id && props.parentId === id) {
      return left(
        new InvalidParentCategoryError(
          'Uma categoria não pode pertencer a si mesma.',
        ),
      );
    }

    return right(new Category({ ...props }, id));
  }

  static reconstitute(props: CategoryProps, id: string): Category {
    return new Category(props, id);
  }

  get workspaceId(): string | null {
    return this.props.workspaceId;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get parentId(): string | null {
    return this.props.parentId;
  }

  get isSystemCategory(): boolean {
    return this.props.isSystemCategory;
  }

  get isSubcategory(): boolean {
    return this.props.parentId !== null;
  }

  public updateName(newName: string): Either<Error, void> {
    if (this.props.isSystemCategory) {
      return left(new SystemCategoryModificationError());
    }
    if (!newName || newName.trim() === '') {
      return left(new InvalidCategoryNameError());
    }

    this.props.name = newName;
    return right(undefined);
  }

  public moveToParent(newParentId: string | null): Either<Error, void> {
    if (this.props.isSystemCategory) {
      return left(new SystemCategoryModificationError());
    }
    if (newParentId === '') {
      return left(
        new InvalidParentCategoryError(
          'O ID da categoria pai não pode ser vazio.',
        ),
      );
    }
    if (this.id && newParentId === this.id) {
      return left(
        new InvalidParentCategoryError(
          'Uma categoria não pode pertencer a si mesma.',
        ),
      );
    }

    this.props.parentId = newParentId;
    return right(undefined);
  }
}
