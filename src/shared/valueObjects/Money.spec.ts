import { Money } from './Money';

describe('Money', () => {
  describe('constructor', () => {
    it('deve criar uma instância válida com centavos e moeda', () => {
      const money = new Money(1000, 'BRL');
      expect(money.cents).toBe(1000);
      expect(money.currency).toBe('BRL');
      expect(money.decimal).toBe(10);
    });

    it('deve usar BRL como moeda padrão', () => {
      const money = new Money(500);
      expect(money.currency).toBe('BRL');
    });

    it('deve converter moeda para maiúscula', () => {
      const money = new Money(1000, 'usd');
      expect(money.currency).toBe('USD');
    });

    it('deve lançar erro para centavos não inteiros', () => {
      expect(() => new Money(10.5, 'BRL')).toThrow(
        'Centavos devem ser um número inteiro',
      );
    });

    it('deve permitir valores negativos no construtor', () => {
      // O construtor permite valores negativos para permitir débitos/créditos
      const negativeMoney = new Money(-100, 'BRL');
      expect(negativeMoney.cents).toBe(-100);
      expect(negativeMoney.decimal).toBe(-1);
    });

    it('deve lançar erro para moeda inválida', () => {
      expect(() => new Money(1000, 'BR')).toThrow(
        'Moeda deve ter 3 caracteres (ex: BRL, USD)',
      );
    });
  });

  describe('fromDecimal', () => {
    it('deve criar instância a partir de valor decimal', () => {
      const money = Money.fromDecimal(10.5, 'BRL');
      expect(money.cents).toBe(1050);
      expect(money.decimal).toBe(10.5);
    });

    it('deve arredondar corretamente valores com muitas casas decimais', () => {
      const money = Money.fromDecimal(10.999, 'BRL');
      expect(money.cents).toBe(1100); // Arredonda para 11.00
    });

    it('deve lançar erro para valores negativos', () => {
      expect(() => Money.fromDecimal(-10.5, 'BRL')).toThrow(
        'Valor não pode ser negativo',
      );
    });
  });

  describe('fromCents', () => {
    it('deve criar instância a partir de centavos', () => {
      const money = Money.fromCents(2550, 'USD');
      expect(money.cents).toBe(2550);
      expect(money.decimal).toBe(25.5);
      expect(money.currency).toBe('USD');
    });
  });

  describe('operações aritméticas', () => {
    let money1: Money;
    let money2: Money;

    beforeEach(() => {
      money1 = Money.fromCents(1000, 'BRL'); // R$ 10,00
      money2 = Money.fromCents(500, 'BRL'); // R$ 5,00
    });

    it('deve somar valores da mesma moeda', () => {
      const result = money1.add(money2);
      expect(result.cents).toBe(1500);
      expect(result.decimal).toBe(15);
    });

    it('deve subtrair valores da mesma moeda', () => {
      const result = money1.subtract(money2);
      expect(result.cents).toBe(500);
      expect(result.decimal).toBe(5);
    });

    it('deve multiplicar por um fator', () => {
      const result = money1.multiply(2.5);
      expect(result.cents).toBe(2500);
      expect(result.decimal).toBe(25);
    });

    it('deve lançar erro ao subtrair resultando em valor negativo', () => {
      expect(() => money2.subtract(money1)).toThrow(
        'Resultado da subtração não pode ser negativo',
      );
    });

    it('deve lançar erro ao multiplicar por fator negativo', () => {
      expect(() => money1.multiply(-1)).toThrow('Fator não pode ser negativo');
    });

    it('deve lançar erro ao operar com moedas diferentes', () => {
      const dollarMoney = Money.fromCents(1000, 'USD');
      expect(() => money1.add(dollarMoney)).toThrow(
        'Não é possível operar com moedas diferentes: BRL e USD',
      );
    });
  });

  describe('comparações', () => {
    let money1: Money;
    let money2: Money;
    let money3: Money;

    beforeEach(() => {
      money1 = Money.fromCents(1000, 'BRL');
      money2 = Money.fromCents(500, 'BRL');
      money3 = Money.fromCents(1000, 'BRL');
    });

    it('deve verificar se é maior que outro valor', () => {
      expect(money1.isGreaterThan(money2)).toBe(true);
      expect(money2.isGreaterThan(money1)).toBe(false);
    });

    it('deve verificar se é menor que outro valor', () => {
      expect(money2.isLessThan(money1)).toBe(true);
      expect(money1.isLessThan(money2)).toBe(false);
    });

    it('deve verificar igualdade', () => {
      expect(money1.equals(money3)).toBe(true);
      expect(money1.equals(money2)).toBe(false);
    });

    it('deve verificar se valor é zero', () => {
      const zeroMoney = Money.fromCents(0);
      expect(zeroMoney.isZero()).toBe(true);
      expect(money1.isZero()).toBe(false);
    });
  });

  describe('formatação', () => {
    it('deve formatar valor em BRL', () => {
      const money = Money.fromCents(123456, 'BRL');
      const formatted = money.toString();
      expect(formatted).toMatch(/R\$\s*1\.234,56/); // Pode variar dependendo da localização
    });

    it('deve converter para JSON', () => {
      const money = Money.fromCents(1500, 'BRL');
      const json = money.toJSON();
      expect(json).toEqual({
        cents: 1500,
        currency: 'BRL',
        decimal: 15,
      });
    });
  });

  describe('casos extremos', () => {
    it('deve trabalhar com valor zero', () => {
      const money = Money.fromCents(0, 'BRL');
      expect(money.isZero()).toBe(true);
      expect(money.decimal).toBe(0);
    });

    it('deve trabalhar com valores grandes', () => {
      const money = Money.fromCents(999999999, 'BRL');
      expect(money.decimal).toBe(9999999.99);
    });

    it('deve arredondar corretamente valores com precisão de ponto flutuante', () => {
      // Teste para casos como 0.1 + 0.2 = 0.30000000000000004
      const money = Money.fromDecimal(0.1 + 0.2, 'BRL');
      expect(money.cents).toBe(30);
      expect(money.decimal).toBe(0.3);
    });
  });
});
