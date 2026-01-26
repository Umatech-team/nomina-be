import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';

export interface WorkspaceProps {
  name: string;
  currency: string;
  ownerId: string;
  createdAt: Date;
}

export class Workspace extends AggregateRoot<WorkspaceProps> {
  constructor(
    props: Optional<WorkspaceProps, 'createdAt' | 'currency'>,
    id?: string,
  ) {
    const workspaceProps: WorkspaceProps = {
      ...props,
      currency: props.currency ?? 'BRL',
      createdAt: props.createdAt ?? new Date(),
    };

    super(workspaceProps, id);
  }

  get name(): string {
    return this.props.name;
  }

  get currency(): string {
    return this.props.currency;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  set name(value: string) {
    this.props.name = value;
  }

  set currency(value: string) {
    this.props.currency = value;
  }
}
