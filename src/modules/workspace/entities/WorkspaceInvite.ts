import { UserRole } from '@constants/enums';
import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';

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
  ): Either<Error, WorkspaceInvite> {
    if (!props.workspaceId)
      return left(new Error('ID do workspace é obrigatório.'));
    if (!props.createdBy)
      return left(new Error('ID do criador é obrigatório.'));
    if (!props.role) return left(new Error('Função (Role) é obrigatória.'));
    if (!props.expiresAt)
      return left(new Error('Data de expiração é obrigatória.'));
    if (props.expiresAt <= new Date() && !id) {
      return left(new Error('A data de expiração deve estar no futuro.'));
    }

    return right(new WorkspaceInvite({ ...props }, id));
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

  get usedAt(): Date | null {
    return this.props.usedAt ?? null;
  }

  get usedBy(): string | null {
    return this.props.usedBy ?? null;
  }

  get isUsed(): boolean {
    return !!this.props.usedAt || !!this.props.usedBy;
  }

  public isExpired(referenceDate: Date = new Date()): boolean {
    return this.props.expiresAt <= referenceDate;
  }

  public accept(userId: string, date: Date = new Date()): Either<Error, void> {
    if (this.isUsed) return left(new Error('Este convite já foi utilizado.'));
    if (this.isExpired(date))
      return left(new Error('Este convite está expirado.'));

    this.props.usedBy = userId;
    this.props.usedAt = date;
    return right(undefined);
  }
}
