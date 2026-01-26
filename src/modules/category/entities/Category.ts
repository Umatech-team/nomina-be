import { TransactionType } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';

export interface CategoryProps {
  workspaceId: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
  parentId: string | null;
}

export class Category extends AggregateRoot<CategoryProps> {
  constructor(
    props: Optional<CategoryProps, 'icon' | 'color' | 'parentId'>,
    id?: string,
  ) {
    const categoryProps: CategoryProps = {
      ...props,
      icon: props.icon ?? null,
      color: props.color ?? null,
      parentId: props.parentId ?? null,
    };

    super(categoryProps, id);
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
