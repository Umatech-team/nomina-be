import { Money } from '@shared/valueObjects/Money';

/**
 * Utilitários para conversão e manipulação de valores Money
 */
export class MoneyUtils {
  /**
   * Converte um valor decimal para centavos de forma segura
   */
  static decimalToCents(amount: number): number {
    if (amount < 0) {
      throw new Error('Valor não pode ser negativo');
    }

    // Multiplica por 100 e arredonda para evitar problemas de precisão
    return Math.round(amount * 100);
  }

  /**
   * Converte centavos para decimal
   */
  static centsToDecimal(cents: number): number {
    if (!Number.isInteger(cents)) {
      throw new Error('Centavos devem ser um número inteiro');
    }

    return cents / 100;
  }

  /**
   * Valida se um valor em centavos é válido
   */
  static isValidCents(cents: unknown): cents is number {
    return typeof cents === 'number' && Number.isInteger(cents) && cents >= 0;
  }

  /**
   * Valida se um valor decimal é válido
   */
  static isValidDecimal(amount: unknown): amount is number {
    return typeof amount === 'number' && amount >= 0 && Number.isFinite(amount);
  }

  /**
   * Formata um valor em centavos para exibição
   */
  static formatCents(cents: number, currency: string = 'BRL'): string {
    const money = Money.fromCents(cents, currency);
    return money.toString();
  }

  /**
   * Calcula a soma de uma lista de valores Money
   */
  static sum(amounts: Money[]): Money {
    if (amounts.length === 0) {
      return Money.fromCents(0);
    }

    return amounts.reduce((acc, current) => acc.add(current));
  }

  /**
   * Encontra o valor máximo em uma lista de Money
   */
  static max(amounts: Money[]): Money | null {
    if (amounts.length === 0) {
      return null;
    }

    return amounts.reduce((max, current) =>
      current.isGreaterThan(max) ? current : max,
    );
  }

  /**
   * Encontra o valor mínimo em uma lista de Money
   */
  static min(amounts: Money[]): Money | null {
    if (amounts.length === 0) {
      return null;
    }

    return amounts.reduce((min, current) =>
      current.isLessThan(min) ? current : min,
    );
  }

  /**
   * Calcula a média de uma lista de Money
   */
  static average(amounts: Money[]): Money | null {
    if (amounts.length === 0) {
      return null;
    }

    const total = this.sum(amounts);
    const avgCents = Math.round(total.cents / amounts.length);
    
    return Money.fromCents(avgCents, total.currency);
  }

  /**
   * Converte um objeto de resposta da API para incluir formatação de dinheiro
   */
  static enrichWithMoneyFormatting(
    obj: Record<string, unknown>,
    moneyFields: string[],
    currency: string = 'BRL',
  ): Record<string, unknown> {
    const enriched = { ...obj };

    moneyFields.forEach((field) => {
      const cents = obj[field];
      if (this.isValidCents(cents)) {
        enriched[`${field}Formatted`] = this.formatCents(cents, currency);
        enriched[`${field}Decimal`] = this.centsToDecimal(cents);
      }
    });

    return enriched;
  }
}
