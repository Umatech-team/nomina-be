import { TransactionType } from '@constants/enums';
import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';
import { InvalidCategoryError } from '../errors/InvalidCategoryError';

export interface CategoryProps {
  workspaceId: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
  parentId: string | null;
}

export class Category extends Entity<CategoryProps> {
  constructor(props: CategoryProps, id?: string) {
    super(props, id);
  }

  static create(
    props: CategoryProps,
    id?: string,
  ): Either<InvalidCategoryError, Category> {
    if (!props.workspaceId) {
      return left(new InvalidCategoryError('O ID do espaço é obrigatório.'));
    }

    if (!props.name) {
      return left(
        new InvalidCategoryError('O nome da categoria é obrigatório.'),
      );
    }

    if (!props.type) {
      return left(
        new InvalidCategoryError('O tipo da categoria é obrigatório.'),
      );
    }

    if (props.parentId === '') {
      return left(
        new InvalidCategoryError(
          'O ID da categoria pai, se fornecido, não pode ser uma string vazia.',
        ),
      );
    }

    const createdCategory: CategoryProps = {
      ...props,
    };
    return right(new Category(createdCategory, id));
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get name(): string {
    return this.props.name;
  }

  get icon(): string | null {
    return this.props.icon;
  }

  get color(): string | null {
    return this.props.color;
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

  set name(value: string) {
    this.props.name = value;
  }

  set icon(value: string | null) {
    this.props.icon = value;
  }

  set color(value: string | null) {
    this.props.color = value;
  }

  set type(value: TransactionType) {
    this.props.type = value;
  }

  set parentId(value: string | null) {
    this.props.parentId = value;
  }
}
