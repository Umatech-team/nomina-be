import { UserRole } from '@constants/enums';
import { HttpException } from '@nestjs/common';
import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';
import { statusCode } from '@shared/core/types/statusCode';

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
    props: Optional<WorkspaceUserProps, 'joinedAt'>,
    id?: string,
  ): Either<HttpException, WorkspaceUser> {
    if (!props.workspaceId) {
      return left(
        new HttpException(
          'ID do workspace é obrigatório',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (!props.userId) {
      return left(
        new HttpException(
          'ID do usuário é obrigatório',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (!props.role) {
      return left(
        new HttpException(
          'Função do usuário é obrigatória',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    const workspaceUserProps: WorkspaceUserProps = {
      ...props,
      joinedAt: props.joinedAt ?? new Date(),
    };

    const workspaceUser = new WorkspaceUser(
      workspaceUserProps,
      id ?? crypto.randomUUID(),
    );
    return right(workspaceUser);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  set workspaceId(value: string) {
    this.props.workspaceId = value;
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
