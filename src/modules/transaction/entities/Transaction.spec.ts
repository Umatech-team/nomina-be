import { TransactionMethod, TransactionType } from '@constants/enums';
import { Money } from '@shared/valueObjects/Money';
import { Transaction } from './Transaction';

describe('Transaction', () => {
  const baseProps = {
    memberId: 1,
    title: 'Test Transaction',
    type: TransactionType.EXPENSE,
    method: TransactionMethod.CARD,
    category: 'Food',
    subCategory: 'Restaurant',
    amount: 2500, // R$ 25,00 em centavos
    currency: 'BRL',
    date: new Date('2025-08-05'),
  };

  describe('constructor', () => {
    it('deve criar uma transação válida', () => {
      const transaction = new Transaction(baseProps);

      expect(transaction.memberId).toBe(1);
      expect(transaction.title).toBe('Test Transaction');
      expect(transaction.type).toBe(TransactionType.EXPENSE);
      expect(transaction.method).toBe(TransactionMethod.CARD);
      expect(transaction.category).toBe('Food');
      expect(transaction.subCategory).toBe('Restaurant');
      expect(transaction.amount).toBe(2500);
      expect(transaction.currency).toBe('BRL');
      expect(transaction.date).toEqual(new Date('2025-08-05'));
      expect(transaction.description).toBeNull();
    });

    it('deve definir valores padrão', () => {
      const transaction = new Transaction(baseProps);

      expect(transaction.createdAt).toBeInstanceOf(Date);
      expect(transaction.updatedAt).toBeNull();
      expect(transaction.description).toBeNull();
    });
  });

  describe('valor monetário', () => {
    let transaction: Transaction;

    beforeEach(() => {
      transaction = new Transaction(baseProps);
    });

    it('deve retornar valor em centavos', () => {
      expect(transaction.amount).toBe(2500);
    });

    it('deve retornar valor decimal', () => {
      expect(transaction.amountDecimal).toBe(25);
    });

    it('deve retornar objeto Money', () => {
      const money = transaction.money;
      expect(money).toBeInstanceOf(Money);
      expect(money.cents).toBe(2500);
      expect(money.currency).toBe('BRL');
      expect(money.decimal).toBe(25);
    });

    it('deve definir valor em centavos', () => {
      transaction.amount = 5000;
      expect(transaction.amount).toBe(5000);
      expect(transaction.amountDecimal).toBe(50);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve definir valor usando objeto Money', () => {
      const newMoney = Money.fromDecimal(15.75, 'USD');
      transaction.money = newMoney;

      expect(transaction.amount).toBe(1575);
      expect(transaction.currency).toBe('USD');
      expect(transaction.amountDecimal).toBe(15.75);
    });

    it('deve definir valor a partir de decimal', () => {
      transaction.setAmountFromDecimal(99.99);
      expect(transaction.amount).toBe(9999);
      expect(transaction.amountDecimal).toBe(99.99);
    });

    it('deve lançar erro para valor negativo em centavos', () => {
      expect(() => {
        transaction.amount = -100;
      }).toThrow('Valor deve ser um número inteiro não negativo (centavos)');
    });

    it('deve lançar erro para valor não inteiro em centavos', () => {
      expect(() => {
        transaction.amount = 100.5;
      }).toThrow('Valor deve ser um número inteiro não negativo (centavos)');
    });

    it('deve lançar erro para valor decimal negativo', () => {
      expect(() => {
        transaction.setAmountFromDecimal(-10.5);
      }).toThrow('Valor não pode ser negativo');
    });
  });

  describe('setters', () => {
    let transaction: Transaction;

    beforeEach(() => {
      transaction = new Transaction(baseProps);
    });

    it('deve atualizar título e updatedAt', () => {
      const initialUpdatedAt = transaction.updatedAt;
      transaction.title = 'New Title';

      expect(transaction.title).toBe('New Title');
      expect(transaction.updatedAt).not.toBe(initialUpdatedAt);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar categoria e updatedAt', () => {
      transaction.category = 'Transport';
      expect(transaction.category).toBe('Transport');
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar subcategoria e updatedAt', () => {
      transaction.subCategory = 'Uber';
      expect(transaction.subCategory).toBe('Uber');
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar método e updatedAt', () => {
      transaction.method = 'PIX';
      expect(transaction.method).toBe(TransactionMethod.PIX);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar tipo e updatedAt', () => {
      transaction.type = 'INCOME';
      expect(transaction.type).toBe(TransactionType.INCOME);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar descrição e updatedAt', () => {
      transaction.description = 'New description';
      expect(transaction.description).toBe('New description');
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar data e updatedAt', () => {
      const newDate = new Date('2025-08-06');
      transaction.date = newDate;
      expect(transaction.date).toBe(newDate);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar moeda e updatedAt', () => {
      transaction.currency = 'USD';
      expect(transaction.currency).toBe('USD');
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar memberId e updatedAt', () => {
      transaction.memberId = 2;
      expect(transaction.memberId).toBe(2);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('casos extremos', () => {
    it('deve trabalhar com valor zero', () => {
      const transaction = new Transaction({
        ...baseProps,
        amount: 0,
      });

      expect(transaction.amount).toBe(0);
      expect(transaction.amountDecimal).toBe(0);
      expect(transaction.money.isZero()).toBe(true);
    });

    it('deve trabalhar com valores grandes', () => {
      const transaction = new Transaction({
        ...baseProps,
        amount: 999999999, // R$ 9.999.999,99
      });

      expect(transaction.amount).toBe(999999999);
      expect(transaction.amountDecimal).toBe(9999999.99);
    });

    it('deve preservar precisão ao converter decimal para centavos', () => {
      const transaction = new Transaction(baseProps);
      
      // Testa problema comum de precisão: 0.1 + 0.2 = 0.30000000000000004
      transaction.setAmountFromDecimal(0.1 + 0.2);
      expect(transaction.amount).toBe(30); // Deve ser exatamente 30 centavos
      expect(transaction.amountDecimal).toBe(0.3);
    });
  });
});
