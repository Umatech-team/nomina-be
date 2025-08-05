import { TransactionMethod, TransactionType } from '@constants/enums';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';
import { Money } from '@shared/valueObjects/Money';
import { TransactionDTO } from '../dto/TransactionDTO';

export class Transaction extends AggregateRoot<TransactionDTO> {
  constructor(
    props: Optional<TransactionDTO, 'createdAt' | 'updatedAt' | 'description'>,
    id?: number,
  ) {
    const transactionProps: TransactionDTO = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      description: props.description ?? null,
      category: props.category,
      subCategory: props.subCategory,
      amount: props.amount, // Agora em centavos
      currency: props.currency,
      date: props.date,
      memberId: props.memberId,
      type: props.type,
      method: props.method,
      title: props.title,
    };

    super(transactionProps, id);
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get memberId() {
    return this.props.memberId;
  }

  get title() {
    return this.props.title;
  }

  set title(title: string) {
    this.props.title = title;
    this.touch();
  }

  set memberId(memberId: number) {
    this.props.memberId = memberId;
    this.touch();
  }

  get description(): string | null {
    return this.props.description ?? null;
  }

  set description(description: string) {
    this.props.description = description;
    this.touch();
  }

  get category() {
    return this.props.category;
  }

  set category(category: string) {
    this.props.category = category;
    this.touch();
  }

  get subCategory() {
    return this.props.subCategory;
  }

  set subCategory(subCategory: string) {
    this.props.subCategory = subCategory;
    this.touch();
  }

  get method() {
    return this.props.method;
  }

  set method(method: string) {
    this.props.method = method as TransactionMethod;
    this.touch();
  }

  /**
   * Retorna o valor em centavos (valor bruto do banco)
   */
  get amount(): number {
    return this.props.amount;
  }

  /**
   * Define o valor em centavos
   */
  set amount(amount: number) {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new Error(
        'Valor deve ser um número inteiro não negativo (centavos)',
      );
    }
    this.props.amount = amount;
    this.touch();
  }

  /**
   * Retorna o valor como objeto Money
   */
  get money(): Money {
    return Money.fromCents(this.props.amount, this.props.currency);
  }

  /**
   * Define o valor usando objeto Money
   */
  set money(money: Money) {
    this.props.amount = money.cents;
    this.props.currency = money.currency;
    this.touch();
  }

  /**
   * Retorna o valor em formato decimal (para exibição)
   */
  get amountDecimal(): number {
    return this.props.amount / 100;
  }

  /**
   * Define o valor a partir de um decimal (converte para centavos)
   */
  setAmountFromDecimal(decimal: number): void {
    if (decimal < 0) {
      throw new Error('Valor não pode ser negativo');
    }
    this.props.amount = Math.round(decimal * 100);
    this.touch();
  }

  get currency() {
    return this.props.currency;
  }

  set currency(currency: string) {
    this.props.currency = currency;
    this.touch();
  }

  get date() {
    return this.props.date;
  }

  set date(date: Date) {
    this.props.date = date;
    this.touch();
  }

  get type() {
    return this.props.type;
  }

  set type(type: string) {
    this.props.type = type as TransactionType;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
