import { MemberRole } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';

export interface WorkspaceUserProps {
  workspaceId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}

export class WorkspaceUser extends AggregateRoot<WorkspaceUserProps> {
  constructor(
    props: Optional<WorkspaceUserProps, 'joinedAt' | 'role'>,
    id?: string,
  ) {
    const workspaceUserProps: WorkspaceUserProps = {
      ...props,
      role: props.role ?? MemberRole.MEMBER,
      joinedAt: props.joinedAt ?? new Date(),
    };

    super(workspaceUserProps, id);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): MemberRole {
    return this.props.role;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  set role(value: MemberRole) {
    this.props.role = value;
  }
}
