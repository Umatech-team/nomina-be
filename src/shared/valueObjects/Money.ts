/**
 * Value Object para representar valores monetários em centavos
 * Evita problemas de precisão de ponto flutuante mantendo valores como inteiros
 */
export class Money {
  private readonly _cents: number;
  private readonly _currency: string;

  constructor(cents: number, currency: string = 'BRL') {
    if (!Number.isInteger(cents)) {
      throw new Error('Centavos devem ser um número inteiro');
    }

    console.log({ cents });

    // if (cents < 0) {
    //   throw new Error('Valor não pode ser negativo');
    // }

    if (!currency || currency.length !== 3) {
      throw new Error('Moeda deve ter 3 caracteres (ex: BRL, USD)');
    }

    this._cents = cents;
    this._currency = currency.toUpperCase();
  }

  /**
   * Cria uma instância de Money a partir de um valor em reais/dólares
   */
  static fromDecimal(amount: number, currency: string = 'BRL'): Money {
    if (amount < 0) {
      throw new Error('Valor não pode ser negativo');
    }

    // Multiplica por 100 e arredonda para evitar problemas de precisão
    const cents = Math.round(amount * 100);
    return new Money(cents, currency);
  }

  /**
   * Cria uma instância de Money a partir de centavos
   */
  static fromCents(cents: number, currency: string = 'BRL'): Money {
    return new Money(cents, currency);
  }

  /**
   * Retorna o valor em centavos
   */
  get cents(): number {
    return this._cents;
  }

  /**
   * Retorna o valor em formato decimal (reais/dólares)
   */
  get decimal(): number {
    return this._cents / 100;
  }

  /**
   * Retorna a moeda
   */
  get currency(): string {
    return this._currency;
  }

  /**
   * Adiciona outro valor Money
   */
  add(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this._cents + other._cents, this._currency);
  }

  /**
   * Subtrai outro valor Money
   */
  subtract(other: Money): Money {
    this.validateSameCurrency(other);
    const result = this._cents - other._cents;

    if (result < 0) {
      throw new Error('Resultado da subtração não pode ser negativo');
    }

    return new Money(result, this._currency);
  }

  /**
   * Multiplica por um fator
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Fator não pode ser negativo');
    }

    const result = Math.round(this._cents * factor);
    return new Money(result, this._currency);
  }

  /**
   * Verifica se é maior que outro valor
   */
  isGreaterThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this._cents > other._cents;
  }

  /**
   * Verifica se é menor que outro valor
   */
  isLessThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this._cents < other._cents;
  }

  /**
   * Verifica se é igual a outro valor
   */
  equals(other: Money): boolean {
    return this._cents === other._cents && this._currency === other._currency;
  }

  /**
   * Verifica se o valor é zero
   */
  isZero(): boolean {
    return this._cents === 0;
  }

  /**
   * Retorna representação formatada do valor
   */
  toString(): string {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this._currency,
    });

    return formatter.format(this.decimal);
  }

  /**
   * Converte para objeto plano para serialização
   */
  toJSON(): { cents: number; currency: string; decimal: number } {
    return {
      cents: this._cents,
      currency: this._currency,
      decimal: this.decimal,
    };
  }

  private validateSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Não é possível operar com moedas diferentes: ${this._currency} e ${other._currency}`,
      );
    }
  }
}
