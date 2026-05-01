import { UserRole } from '@constants/enums';
import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';

export interface WorkspaceUserProps {
  workspaceId: string;
  userId: string;
  role: UserRole;
  isDefault: boolean;
  joinedAt: Date;
}

export class WorkspaceUser extends Entity<WorkspaceUserProps> {
  private constructor(props: WorkspaceUserProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Optional<WorkspaceUserProps, 'joinedAt'>,
    id?: string,
  ): Either<Error, WorkspaceUser> {
    if (!props.workspaceId)
      return left(new Error('ID do workspace é obrigatório.'));
    if (!props.userId) return left(new Error('ID do usuário é obrigatório.'));
    if (!props.role) return left(new Error('Função (Role) é obrigatória.'));

    const workspaceUserProps: WorkspaceUserProps = {
      ...props,
      joinedAt: props.joinedAt ?? new Date(),
    };

    return right(new WorkspaceUser(workspaceUserProps, id));
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  public changeRole(newRole: UserRole): void {
    this.props.role = newRole;
  }

  public markAsDefault(): void {
    this.props.isDefault = true;
  }

  public removeDefault(): void {
    this.props.isDefault = false;
  }
}
