import { UserRole } from '@constants/enums';
import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';
import { InvalidWorkspaceUserError } from '../errors/InvalidWorkspaceUserError';

export interface WorkspaceUserProps {
  workspaceId: string;
  isDefault: boolean;
  userId: string;
  role: UserRole;
  joinedAt: Date;
}

export class WorkspaceUser extends Entity<WorkspaceUserProps> {
  private constructor(props: WorkspaceUserProps, id?: string) {
    super(props, id);
  }

  static create(
    props: WorkspaceUserProps,
    id?: string,
  ): Either<InvalidWorkspaceUserError, WorkspaceUser> {
    if (!props.workspaceId) {
      return left(
        new InvalidWorkspaceUserError('ID do workspace é obrigatório'),
      );
    }

    if (!props.userId) {
      return left(new InvalidWorkspaceUserError('ID do usuário é obrigatório'));
    }

    if (!props.role) {
      return left(
        new InvalidWorkspaceUserError('Função do usuário é obrigatória'),
      );
    }

    const workspaceUserProps: WorkspaceUserProps = {
      ...props,
      joinedAt: props.joinedAt ?? new Date(),
    };

    const workspaceUser = new WorkspaceUser(workspaceUserProps, id);
    return right(workspaceUser);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  set isDefault(value: boolean) {
    this.props.isDefault = value;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  set role(value: UserRole) {
    this.props.role = value;
  }
}
