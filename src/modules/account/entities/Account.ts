import { AccountType } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';

export interface AccountProps {
  workspaceId: string;
  name: string;
  type: AccountType;
  balance: bigint;
  icon: string | null;
  color: string | null;
  closingDay: number | null;
  dueDay: number | null;
}

export class Account extends AggregateRoot<AccountProps> {
  constructor(
    props: Optional<
      AccountProps,
      'balance' | 'icon' | 'color' | 'closingDay' | 'dueDay'
    >,
    id?: string,
  ) {
    const accountProps: AccountProps = {
      ...props,
      balance: props.balance ?? BigInt(0),
      icon: props.icon ?? null,
      color: props.color ?? null,
      closingDay: props.closingDay ?? null,
      dueDay: props.dueDay ?? null,
    };

    super(accountProps, id);
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): AccountType {
    return this.props.type;
  }

  get balance(): bigint {
    return this.props.balance;
  }

  get balanceDecimal(): number {
    return Number(this.props.balance) / 100;
  }

  get icon(): string | null {
    return this.props.icon;
  }

  get color(): string | null {
    return this.props.color;
  }

  get closingDay(): number | null {
    return this.props.closingDay;
  }

  get dueDay(): number | null {
    return this.props.dueDay;
  }

  set name(value: string) {
    this.props.name = value;
  }

  set type(value: AccountType) {
    this.props.type = value;
  }

  set balance(value: bigint) {
    this.props.balance = value;
  }

  set icon(value: string | null) {
    this.props.icon = value;
  }

  set color(value: string | null) {
    this.props.color = value;
  }

  set closingDay(value: number | null) {
    this.props.closingDay = value;
  }

  set dueDay(value: number | null) {
    this.props.dueDay = value;
  }

  addToBalance(amount: bigint): void {
    this.props.balance += amount;
  }

  subtractFromBalance(amount: bigint): void {
    this.props.balance -= amount;
  }
}
