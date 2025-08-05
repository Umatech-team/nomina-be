import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';
import { Money } from '@shared/valueObjects/Money';
import { GoalDTO } from '../dto/GoalDTO';

export class Goal extends AggregateRoot<GoalDTO> {
  constructor(
    props: Optional<GoalDTO, 'createdAt' | 'updatedAt'>,
    id?: number,
  ) {
    const transactionProps: GoalDTO = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      title: props.title,
      memberId: props.memberId,
      targetAmount: props.targetAmount, // Agora em centavos
      currentAmount: props.currentAmount, // Agora em centavos
      monthlyContribution: props.monthlyContribution, // Agora em centavos
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

  /**
   * Retorna o valor alvo em centavos (valor bruto do banco)
   */
  get targetAmount() {
    return this.props.targetAmount;
  }

  /**
   * Define o valor alvo em centavos
   */
  set targetAmount(targetAmount: number) {
    if (!Number.isInteger(targetAmount) || targetAmount < 0) {
      throw new Error(
        'Valor deve ser um número inteiro não negativo (centavos)',
      );
    }
    this.props.targetAmount = targetAmount;
    this.touch();
  }

  /**
   * Retorna o valor alvo como objeto Money
   */
  get targetMoney(): Money {
    return Money.fromCents(this.props.targetAmount, 'BRL');
  }

  /**
   * Retorna o valor alvo em formato decimal (para exibição)
   */
  get targetAmountDecimal(): number {
    return this.props.targetAmount / 100;
  }

  /**
   * Define o valor alvo a partir de um decimal (converte para centavos)
   */
  setTargetAmountFromDecimal(decimal: number): void {
    if (decimal < 0) {
      throw new Error('Valor não pode ser negativo');
    }
    this.props.targetAmount = Math.round(decimal * 100);
    this.touch();
  }

  set memberId(memberId: number) {
    this.props.memberId = memberId;
    this.touch();
  }

  get title() {
    return this.props.title;
  }

  set title(title: string) {
    this.props.title = title;
    this.touch();
  }

  /**
   * Retorna o valor atual em centavos (valor bruto do banco)
   */
  get currentAmount() {
    return this.props.currentAmount;
  }

  /**
   * Define o valor atual em centavos
   */
  set currentAmount(currentAmount: number) {
    if (!Number.isInteger(currentAmount) || currentAmount < 0) {
      throw new Error(
        'Valor deve ser um número inteiro não negativo (centavos)',
      );
    }
    this.props.currentAmount = currentAmount;
    this.touch();
  }

  /**
   * Retorna o valor atual como objeto Money
   */
  get currentMoney(): Money {
    return Money.fromCents(this.props.currentAmount, 'BRL');
  }

  /**
   * Retorna o valor atual em formato decimal (para exibição)
   */
  get currentAmountDecimal(): number {
    return this.props.currentAmount / 100;
  }

  /**
   * Define o valor atual a partir de um decimal (converte para centavos)
   */
  setCurrentAmountFromDecimal(decimal: number): void {
    if (decimal < 0) {
      throw new Error('Valor não pode ser negativo');
    }
    this.props.currentAmount = Math.round(decimal * 100);
    this.touch();
  }

  /**
   * Retorna a contribuição mensal em centavos (valor bruto do banco)
   */
  get monthlyContribution() {
    return this.props.monthlyContribution;
  }

  /**
   * Define a contribuição mensal em centavos
   */
  set monthlyContribution(monthlyContribution: number) {
    if (!Number.isInteger(monthlyContribution) || monthlyContribution < 0) {
      throw new Error(
        'Valor deve ser um número inteiro não negativo (centavos)',
      );
    }
    this.props.monthlyContribution = monthlyContribution;
    this.touch();
  }

  /**
   * Retorna a contribuição mensal como objeto Money
   */
  get monthlyContributionMoney(): Money {
    return Money.fromCents(this.props.monthlyContribution, 'BRL');
  }

  /**
   * Retorna a contribuição mensal em formato decimal (para exibição)
   */
  get monthlyContributionDecimal(): number {
    return this.props.monthlyContribution / 100;
  }

  /**
   * Define a contribuição mensal a partir de um decimal (converte para centavos)
   */
  setMonthlyContributionFromDecimal(decimal: number): void {
    if (decimal < 0) {
      throw new Error('Valor não pode ser negativo');
    }
    this.props.monthlyContribution = Math.round(decimal * 100);
    this.touch();
  }

  get category() {
    return this.props.category;
  }

  set category(category: string) {
    this.props.category = category;
    this.touch();
  }

  /**
   * Calcula o progresso da meta em percentual
   */
  get progressPercentage(): number {
    if (this.props.targetAmount === 0) return 0;
    return Math.min(
      (this.props.currentAmount / this.props.targetAmount) * 100,
      100,
    );
  }

  /**
   * Calcula quanto falta para atingir a meta
   */
  get remainingAmount(): number {
    return Math.max(this.props.targetAmount - this.props.currentAmount, 0);
  }

  /**
   * Retorna o valor restante como objeto Money
   */
  get remainingMoney(): Money {
    return Money.fromCents(this.remainingAmount, 'BRL');
  }

  /**
   * Calcula quantos meses restam para atingir a meta
   */
  get estimatedMonthsToComplete(): number | null {
    if (this.props.monthlyContribution <= 0) return null;
    return Math.ceil(this.remainingAmount / this.props.monthlyContribution);
  }

  /**
   * Adiciona uma contribuição ao valor atual
   */
  addContribution(amountInCents: number): void {
    if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
      throw new Error(
        'Contribuição deve ser um número inteiro positivo (centavos)',
      );
    }
    this.props.currentAmount += amountInCents;
    this.touch();
  }

  /**
   * Verifica se a meta foi atingida
   */
  get isCompleted(): boolean {
    return this.props.currentAmount >= this.props.targetAmount;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
