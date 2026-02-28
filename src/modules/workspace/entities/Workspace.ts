import { HttpException } from '@nestjs/common';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';

export interface WorkspaceProps {
  name: string;
  currency: string;
  createdAt: Date;
}

export class Workspace extends AggregateRoot<WorkspaceProps> {
  constructor(props: WorkspaceProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Optional<WorkspaceProps, 'createdAt' | 'currency'>,
    id?: string,
  ): Either<HttpException, Workspace> {
    const workspaceProps: WorkspaceProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      currency: props.currency ?? 'BRL',
    };

    const workspace = new Workspace(workspaceProps, id ?? crypto.randomUUID());
    return right(workspace);
  }

  get name(): string {
    return this.props.name;
  }

  get currency(): string {
    return this.props.currency;
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
