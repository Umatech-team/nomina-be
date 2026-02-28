import { UserRole } from '@constants/enums';
import { HttpException } from '@nestjs/common';
import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';

export interface WorkspaceInviteProps {
  code: string;
  workspaceId: string;
  role: UserRole;
  createdBy: string;
  expiresAt: Date;
  usedAt?: Date | null;
  usedBy?: string | null;
}

export class WorkspaceInvite extends Entity<WorkspaceInviteProps> {
  private constructor(props: WorkspaceInviteProps, id?: string) {
    super(props, id);
  }

  static create(
    props: WorkspaceInviteProps,
    id?: string,
  ): Either<HttpException, WorkspaceInvite> {
    if (!props.workspaceId) {
      return left(
        new HttpException(
          'ID do workspace é obrigatório',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (!props.createdBy) {
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

    if (!props.expiresAt) {
      return left(
        new HttpException(
          'Data de expiração é obrigatória',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    const workspaceInviteProps: WorkspaceInviteProps = {
      ...props,
    };

    const workspaceInvite = new WorkspaceInvite(workspaceInviteProps, id);
    return right(workspaceInvite);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get code(): string {
    return this.props.code;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get usedAt(): Date | null | undefined {
    return this.props.usedAt;
  }

  get usedBy(): string | null | undefined {
    return this.props.usedBy;
  }

  set usedAt(date: Date) {
    this.props.usedAt = date;
  }

  set usedBy(userId: string) {
    this.props.usedBy = userId;
  }
}
