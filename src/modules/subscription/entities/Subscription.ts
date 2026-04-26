import { SubscriptionStatus } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';

export interface SubscriptionProps {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
}

export class Subscription extends AggregateRoot<SubscriptionProps> {
  private constructor(props: SubscriptionProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Optional<SubscriptionProps, 'status'>,
    id?: string,
  ): Either<Error, Subscription> {
    const subscriptionProps: SubscriptionProps = {
      ...props,
      status: props.status ?? SubscriptionStatus.TRIALING,
    };
    return right(new Subscription(subscriptionProps, id));
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

  public changePlan(newPlanId: string): void {
    this.props.planId = newPlanId;
  }

  public renew(newPeriodEnd: Date): void {
    this.props.currentPeriodEnd = newPeriodEnd;
    this.props.status = SubscriptionStatus.ACTIVE;
  }

  public cancel(): void {
    this.props.status = SubscriptionStatus.CANCELED;
  }

  public activate(): void {
    this.props.status = SubscriptionStatus.ACTIVE;
  }

  public markPastDue(): void {
    this.props.status = SubscriptionStatus.PAST_DUE;
  }

  public hasAccess(): boolean {
    return (
      this.props.status === SubscriptionStatus.ACTIVE ||
      this.props.status === SubscriptionStatus.TRIALING
    );
  }

  public isExpired(referenceDate: Date): boolean {
    return this.props.currentPeriodEnd < referenceDate;
  }
}
