import { SubscriptionStatus } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';

export interface SubscriptionProps {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
}

export class Subscription extends AggregateRoot<SubscriptionProps> {
  constructor(props: Optional<SubscriptionProps, 'status'>, id?: string) {
    const subscriptionProps: SubscriptionProps = {
      ...props,
      status: props.status ?? SubscriptionStatus.TRIALING,
    };

    super(subscriptionProps, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get planId(): string {
    return this.props.planId;
  }

  get status(): SubscriptionStatus {
    return this.props.status;
  }

  get currentPeriodEnd(): Date {
    return this.props.currentPeriodEnd;
  }

  set planId(value: string) {
    this.props.planId = value;
  }

  set status(value: SubscriptionStatus) {
    this.props.status = value;
  }

  set currentPeriodEnd(value: Date) {
    this.props.currentPeriodEnd = value;
  }

  cancel(): void {
    this.props.status = SubscriptionStatus.CANCELED;
  }

  activate(): void {
    this.props.status = SubscriptionStatus.ACTIVE;
  }

  markPastDue(): void {
    this.props.status = SubscriptionStatus.PAST_DUE;
  }

  isActive(): boolean {
    return this.props.status === SubscriptionStatus.ACTIVE;
  }

  isExpired(): boolean {
    return this.props.currentPeriodEnd < new Date();
  }
}
