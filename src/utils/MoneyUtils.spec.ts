import { Money } from '@shared/valueObjects/Money';
import { MoneyUtils } from './MoneyUtils';

describe('MoneyUtils', () => {
  describe('decimalToCents', () => {
    it('deve converter valor decimal para centavos', () => {
      expect(MoneyUtils.decimalToCents(10.5)).toBe(1050);
      expect(MoneyUtils.decimalToCents(0.99)).toBe(99);
      expect(MoneyUtils.decimalToCents(100)).toBe(10000);
    });

    it('deve arredondar corretamente valores com muitas casas decimais', () => {
      expect(MoneyUtils.decimalToCents(10.999)).toBe(1100);
      expect(MoneyUtils.decimalToCents(0.001)).toBe(0);
    });

    it('deve lançar erro para valores negativos', () => {
      expect(() => MoneyUtils.decimalToCents(-10.5)).toThrow(
        'Valor não pode ser negativo',
      );
    });
  });

  describe('centsToDecimal', () => {
    it('deve converter centavos para decimal', () => {
      expect(MoneyUtils.centsToDecimal(1050)).toBe(10.5);
      expect(MoneyUtils.centsToDecimal(99)).toBe(0.99);
      expect(MoneyUtils.centsToDecimal(10000)).toBe(100);
    });

    it('deve arredondar valores não inteiros', () => {
      expect(MoneyUtils.centsToDecimal(10.7)).toBe(0.11); // Arredondado para 11 centavos
      expect(MoneyUtils.centsToDecimal(10.3)).toBe(0.1); // Arredondado para 10 centavos
    });

    it('deve retornar 0 para valores inválidos', () => {
      expect(MoneyUtils.centsToDecimal(NaN)).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(MoneyUtils.centsToDecimal(undefined as any)).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(MoneyUtils.centsToDecimal(null as any)).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(MoneyUtils.centsToDecimal('invalid' as any)).toBe(0);
    });

    it('deve lidar com valores BigInt convertidos', () => {
      // Simula valores que vêm do banco de dados como BigInt
      expect(MoneyUtils.centsToDecimal(Number(BigInt(1050)))).toBe(10.5);
      expect(MoneyUtils.centsToDecimal(0)).toBe(0);
    });
  });

  describe('validação', () => {
    describe('isValidCents', () => {
      it('deve validar centavos válidos', () => {
        expect(MoneyUtils.isValidCents(0)).toBe(true);
        expect(MoneyUtils.isValidCents(1000)).toBe(true);
        expect(MoneyUtils.isValidCents(99999)).toBe(true);
      });

      it('deve invalidar centavos inválidos', () => {
        expect(MoneyUtils.isValidCents(-1)).toBe(false);
        expect(MoneyUtils.isValidCents(10.5)).toBe(false);
        expect(MoneyUtils.isValidCents('1000')).toBe(false);
        expect(MoneyUtils.isValidCents(null)).toBe(false);
        expect(MoneyUtils.isValidCents(undefined)).toBe(false);
      });
    });

    describe('isValidDecimal', () => {
      it('deve validar decimais válidos', () => {
        expect(MoneyUtils.isValidDecimal(0)).toBe(true);
        expect(MoneyUtils.isValidDecimal(10.5)).toBe(true);
        expect(MoneyUtils.isValidDecimal(999.99)).toBe(true);
      });

      it('deve invalidar decimais inválidos', () => {
        expect(MoneyUtils.isValidDecimal(-1)).toBe(false);
        expect(MoneyUtils.isValidDecimal(Infinity)).toBe(false);
        expect(MoneyUtils.isValidDecimal(NaN)).toBe(false);
        expect(MoneyUtils.isValidDecimal('10.5')).toBe(false);
        expect(MoneyUtils.isValidDecimal(null)).toBe(false);
        expect(MoneyUtils.isValidDecimal(undefined)).toBe(false);
      });
    });
  });

  describe('formatCents', () => {
    it('deve formatar centavos como moeda', () => {
      const formatted = MoneyUtils.formatCents(123456, 'BRL');
      expect(formatted).toMatch(/R\$\s*1\.234,56/);
    });

    it('deve usar BRL como padrão', () => {
      const formatted = MoneyUtils.formatCents(1000);
      expect(formatted).toMatch(/R\$\s*10,00/);
    });
  });

  describe('operações com arrays', () => {
    let moneyArray: Money[];

    beforeEach(() => {
      moneyArray = [
        Money.fromCents(1000, 'BRL'), // R$ 10,00
        Money.fromCents(2000, 'BRL'), // R$ 20,00
        Money.fromCents(500, 'BRL'), // R$ 5,00
      ];
    });

    describe('sum', () => {
      it('deve somar array de valores Money', () => {
        const result = MoneyUtils.sum(moneyArray);
        expect(result.cents).toBe(3500);
        expect(result.decimal).toBe(35);
      });

      it('deve retornar zero para array vazio', () => {
        const result = MoneyUtils.sum([]);
        expect(result.cents).toBe(0);
        expect(result.isZero()).toBe(true);
      });
    });

    describe('max', () => {
      it('deve encontrar o valor máximo', () => {
        const result = MoneyUtils.max(moneyArray);
        expect(result?.cents).toBe(2000);
      });

      it('deve retornar null para array vazio', () => {
        const result = MoneyUtils.max([]);
        expect(result).toBeNull();
      });
    });

    describe('min', () => {
      it('deve encontrar o valor mínimo', () => {
        const result = MoneyUtils.min(moneyArray);
        expect(result?.cents).toBe(500);
      });

      it('deve retornar null para array vazio', () => {
        const result = MoneyUtils.min([]);
        expect(result).toBeNull();
      });
    });

    describe('average', () => {
      it('deve calcular a média dos valores', () => {
        const result = MoneyUtils.average(moneyArray);
        expect(result?.cents).toBe(1167); // (1000 + 2000 + 500) / 3 = 1166.67, arredondado
      });

      it('deve retornar null para array vazio', () => {
        const result = MoneyUtils.average([]);
        expect(result).toBeNull();
      });
    });
  });

  describe('enrichWithMoneyFormatting', () => {
    it('deve enriquecer objeto com formatação monetária', () => {
      const obj = {
        id: 1,
        amount: 1500,
        monthlyFee: 200,
        name: 'Test',
      };

      const enriched = MoneyUtils.enrichWithMoneyFormatting(
        obj,
        ['amount', 'monthlyFee'],
        'BRL',
      );

      expect(enriched).toMatchObject({
        id: 1,
        amount: 1500,
        monthlyFee: 200,
        name: 'Test',
        amountFormatted: expect.stringMatching(/R\$\s*15,00/),
        amountDecimal: 15,
        monthlyFeeFormatted: expect.stringMatching(/R\$\s*2,00/),
        monthlyFeeDecimal: 2,
      });
    });

    it('deve ignorar campos não monetários', () => {
      const obj = {
        id: 1,
        amount: 1500,
        invalidAmount: 'not a number',
      };

      const enriched = MoneyUtils.enrichWithMoneyFormatting(obj, [
        'amount',
        'invalidAmount',
      ]);

      expect(enriched).toMatchObject({
        id: 1,
        amount: 1500,
        invalidAmount: 'not a number',
        amountDecimal: 15,
      });

      expect(enriched).not.toHaveProperty('invalidAmountFormatted');
      expect(enriched).not.toHaveProperty('invalidAmountDecimal');
    });
  });
});
