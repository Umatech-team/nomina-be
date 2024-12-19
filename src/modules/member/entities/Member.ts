import { PaymentStatus, PlanType, SupportTier } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';
import { MemberDTO } from '../dto/MemberDTO';

export class Member extends AggregateRoot<MemberDTO> {
  constructor(
    props: Optional<
      MemberDTO,
      | 'createdAt'
      | 'updatedAt'
      | 'phone'
      | 'paymentStatus'
      | 'planStartDate'
      | 'planEndDate'
      | 'renewalDate'
      | 'language'
      | 'plan'
      | 'supportTier'
      | 'timezone'
      | 'currency'
    >,
    id?: number,
  ) {
    const userProps: MemberDTO = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      phone: props.phone ?? null,
      plan: props.plan ?? PlanType.FREE,
      planStartDate: props.planStartDate ?? new Date(),
      planEndDate: props.planEndDate ?? null,
      paymentStatus: props.paymentStatus ?? PaymentStatus.PAID,
      renewalDate: props.renewalDate ?? null,
      language: props.language ?? 'pt-BR',
      timezone: props.timezone ?? 'America/Sao_Paulo',
      currency: props.currency ?? 'BRL',
      supportTier: props.supportTier ?? SupportTier.STANDARD,
    };

    super(userProps, id);
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get email() {
    return this.props.email;
  }

  set email(email: string) {
    this.props.email = email;
    this.touch();
  }

  get phone(): string | null {
    return this.props.phone ?? null;
  }

  set phone(phone: string) {
    this.props.phone = phone;
    this.touch();
  }

  get password() {
    return this.props.password;
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  get plan() {
    return this.props.plan;
  }

  set plan(plan: PlanType) {
    this.props.plan = plan;
    this.touch();
  }

  get planStartDate() {
    return this.props.planStartDate;
  }

  set planStartDate(planStartDate: Date) {
    this.props.planStartDate = planStartDate;
    this.touch();
  }

  get planEndDate(): Date | null {
    return this.props.planEndDate;
  }

  set planEndDate(planEndDate: Date) {
    this.props.planEndDate = planEndDate;
    this.touch();
  }

  get paymentStatus() {
    return this.props.paymentStatus;
  }

  set paymentStatus(paymentStatus: PaymentStatus) {
    this.props.paymentStatus = paymentStatus;
    this.touch();
  }

  get renewalDate(): Date | null {
    return this.props.renewalDate;
  }

  set renewalDate(renewalDate: Date) {
    this.props.renewalDate = renewalDate;
    this.touch();
  }

  get timezone() {
    return this.props.timezone;
  }

  set timezone(timezone: string) {
    this.props.timezone = timezone;
    this.touch();
  }

  get language() {
    return this.props.language;
  }

  set language(language: string) {
    this.props.language = language;
    this.touch();
  }

  get currency() {
    return this.props.currency;
  }

  set currency(currency: string) {
    this.props.currency = currency;
    this.touch();
  }

  get supportTier() {
    return this.props.supportTier;
  }

  set supportTier(supportTier: SupportTier) {
    this.props.supportTier = supportTier;
    this.touch();
  }

  touch() {
    this.props.updatedAt = new Date();
  }
}

// Eventos de domínio
// class PlayerEvent implements DomainEvent {
//   constructor(
//     public readonly playerId: number,
//     public readonly characterId: number,
//   ) {}
// }
