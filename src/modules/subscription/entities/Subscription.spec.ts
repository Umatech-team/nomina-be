import { SubscriptionStatus } from '@constants/enums';
import { Subscription } from './Subscription';

describe('Subscription entity', () => {
  const FUTURE = new Date(Date.now() + 86_400_000);
  const PAST = new Date(Date.now() - 86_400_000);

  function makeProps(
    overrides: Partial<Parameters<typeof Subscription.create>[0]> = {},
  ) {
    return {
      userId: 'user-1',
      planId: 'plan-free',
      currentPeriodEnd: FUTURE,
      ...overrides,
    };
  }

  function makeSub(overrides = {}) {
    const result = Subscription.create(makeProps(overrides));
    if (result.isLeft()) throw result.value;
    return result.value;
  }

  describe('create()', () => {
    it('should default status to TRIALING', () => {
      expect(makeSub().status).toBe(SubscriptionStatus.TRIALING);
    });

    it('should use provided status', () => {
      const sub = makeSub({ status: SubscriptionStatus.ACTIVE });
      expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  describe('changePlan()', () => {
    it('should update planId', () => {
      const sub = makeSub();
      sub.changePlan('plan-pro');
      expect(sub.planId).toBe('plan-pro');
    });
  });

  describe('renew()', () => {
    it('should set status to ACTIVE and update currentPeriodEnd', () => {
      const sub = makeSub();
      const newEnd = new Date(Date.now() + 30 * 86_400_000);
      sub.renew(newEnd);
      expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
      expect(sub.currentPeriodEnd).toEqual(newEnd);
    });
  });

  describe('cancel()', () => {
    it('should set status to CANCELED', () => {
      const sub = makeSub();
      sub.cancel();
      expect(sub.status).toBe(SubscriptionStatus.CANCELED);
    });
  });

  describe('activate()', () => {
    it('should set status to ACTIVE', () => {
      const sub = makeSub({ status: SubscriptionStatus.PAST_DUE });
      sub.activate();
      expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  describe('markPastDue()', () => {
    it('should set status to PAST_DUE', () => {
      const sub = makeSub();
      sub.markPastDue();
      expect(sub.status).toBe(SubscriptionStatus.PAST_DUE);
    });
  });

  describe('hasAccess()', () => {
    it.each<[SubscriptionStatus, boolean]>([
      [SubscriptionStatus.ACTIVE, true],
      [SubscriptionStatus.TRIALING, true],
      [SubscriptionStatus.CANCELED, false],
      [SubscriptionStatus.PAST_DUE, false],
    ])('should return %s for status %s', (status, expected) => {
      const sub = makeSub({ status });
      expect(sub.hasAccess()).toBe(expected);
    });
  });

  describe('isExpired()', () => {
    it('should return false when period end is in the future', () => {
      expect(makeSub().isExpired(new Date())).toBe(false);
    });

    it('should return true when period end is in the past', () => {
      const sub = makeSub({ currentPeriodEnd: PAST });
      expect(sub.isExpired(new Date())).toBe(true);
    });
  });
});
