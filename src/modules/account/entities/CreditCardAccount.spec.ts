import { CreditCard } from './CreditCardAccount';

describe('CreditCard entity', () => {
  function makeProps(
    overrides: Partial<Parameters<typeof CreditCard.create>[0]> = {},
  ) {
    return {
      workspaceId: 'workspace-1',
      name: 'Visa Gold',
      timezone: 'America/Sao_Paulo',
      creditLimit: 5000n,
      closingDay: 10,
      dueDay: 20,
      ...overrides,
    };
  }

  function makeCard(overrides = {}) {
    const result = CreditCard.create(makeProps(overrides));
    if (result.isLeft())
      throw new Error('Failed to create CreditCard: ' + result.value.message);
    return result.value;
  }

  describe('create()', () => {
    it('should create a valid credit card', () => {
      expect(CreditCard.create(makeProps()).isRight()).toBe(true);
    });

    it.each<[Partial<Parameters<typeof CreditCard.create>[0]>, string]>([
      [{ creditLimit: 0n }, 'zero credit limit'],
      [{ creditLimit: -100n }, 'negative credit limit'],
      [{ closingDay: 0 }, 'closingDay 0'],
      [{ closingDay: 32 }, 'closingDay 32'],
      [{ dueDay: 0 }, 'dueDay 0'],
      [{ dueDay: 32 }, 'dueDay 32'],
    ])('should reject %s', (props, _label) => {
      expect(CreditCard.create(makeProps(props)).isLeft()).toBe(true);
    });

    it('should default balance to 0 when not provided', () => {
      const card = makeCard();
      expect(card.balance).toBe(0n);
    });
  });

  describe('registerCharge()', () => {
    it('should increase balance', () => {
      const card = makeCard();
      card.registerCharge(1000n);
      expect(card.balance).toBe(1000n);
    });

    it('should reject zero amount', () => {
      expect(makeCard().registerCharge(0n).isLeft()).toBe(true);
    });

    it('should reject charge exceeding available limit', () => {
      const card = makeCard({ creditLimit: 1000n });
      expect(card.registerCharge(1500n).isLeft()).toBe(true);
    });
  });

  describe('payInvoice()', () => {
    it('should decrease balance on payment', () => {
      const card = makeCard();
      card.registerCharge(500n);
      card.payInvoice(500n);
      expect(card.balance).toBe(0n);
    });

    it('should reject zero amount', () => {
      expect(makeCard().payInvoice(0n).isLeft()).toBe(true);
    });

    it('should reject payment exceeding current balance', () => {
      const card = makeCard();
      card.registerCharge(200n);
      expect(card.payInvoice(500n).isLeft()).toBe(true);
    });
  });

  describe('adjustLimit()', () => {
    it('should update credit limit', () => {
      const card = makeCard();
      card.adjustLimit(10000n);
      expect(card.creditLimit).toBe(10000n);
    });

    it('should reject zero or negative limit', () => {
      expect(makeCard().adjustLimit(0n).isLeft()).toBe(true);
      expect(makeCard().adjustLimit(-500n).isLeft()).toBe(true);
    });
  });

  describe('updateInvoiceDates()', () => {
    it('should update closingDay and dueDay', () => {
      const card = makeCard();
      card.updateInvoiceDates(15, 25);
      expect(card.closingDay).toBe(15);
      expect(card.dueDay).toBe(25);
    });

    it.each([
      [0, 10],
      [32, 10],
      [10, 0],
      [10, 32],
    ])(
      'should reject invalid dates closingDay=%d dueDay=%d',
      (closing, due) => {
        expect(makeCard().updateInvoiceDates(closing, due).isLeft()).toBe(true);
      },
    );
  });
});
