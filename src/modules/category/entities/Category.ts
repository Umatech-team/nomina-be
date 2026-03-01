import { TransactionType } from '@constants/enums';
import { HttpException } from '@nestjs/common';
import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';

export interface CategoryProps {
  workspaceId: string | null;
  name: string;
  type: TransactionType;
  parentId: string | null;
  isSystemCategory: boolean;
}

export class Category extends Entity<CategoryProps> {
  constructor(props: CategoryProps, id?: string) {
    super(props, id);
  }

  static create(
    props: CategoryProps,
    id?: string,
  ): Either<HttpException, Category> {
    if (!props.name) {
      return left(
        new HttpException('Category name is required.', statusCode.BAD_REQUEST),
      );
    }

    if (!props.type) {
      return left(
        new HttpException('Category type is required.', statusCode.BAD_REQUEST),
      );
    }

    if (props.parentId === '') {
      return left(
        new HttpException(
          'Parent category ID, if provided, cannot be an empty string.',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    const createdCategory: CategoryProps = {
      ...props,
    };
    return right(new Category(createdCategory, id));
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

  get isSubcategory(): boolean {
    return this.props.parentId !== null;
  }

  get isSystemCategory(): boolean {
    return this.props.isSystemCategory;
  }

  set name(value: string) {
    this.props.name = value;
  }

  set type(value: TransactionType) {
    this.props.type = value;
  }

  set parentId(value: string | null) {
    this.props.parentId = value;
  }
}
