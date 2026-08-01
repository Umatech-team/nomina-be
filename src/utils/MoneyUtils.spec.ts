import { MoneyUtils } from './MoneyUtils';

describe('MoneyUtils.splitIntoInstallments', () => {
  it('should split an exact amount evenly across installments', () => {
    expect(MoneyUtils.splitIntoInstallments(10000n, 4)).toBe(2500n);
  });

  it('should floor the per-installment value when the division has a remainder', () => {
    expect(MoneyUtils.splitIntoInstallments(10000n, 3)).toBe(3333n);
  });

  it('should return the full amount when installments is 1', () => {
    expect(MoneyUtils.splitIntoInstallments(10000n, 1)).toBe(10000n);
  });

  it('should handle large amounts', () => {
    expect(MoneyUtils.splitIntoInstallments(100000000000n, 12)).toBe(
      8333333333n,
    );
  });

  it('should throw when installments is zero or negative', () => {
    expect(() => MoneyUtils.splitIntoInstallments(10000n, 0)).toThrow();
    expect(() => MoneyUtils.splitIntoInstallments(10000n, -1)).toThrow();
  });

  it('should throw when totalAmountCents is zero or negative', () => {
    expect(() => MoneyUtils.splitIntoInstallments(0n, 3)).toThrow();
    expect(() => MoneyUtils.splitIntoInstallments(-100n, 3)).toThrow();
  });
});
