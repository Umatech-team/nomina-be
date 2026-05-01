import { RefreshToken } from './RefreshToken';

describe('RefreshToken entity', () => {
  const FUTURE = new Date(Date.now() + 86_400_000);
  const PAST = new Date(Date.now() - 86_400_000);

  function makeProps(
    overrides: Partial<Parameters<typeof RefreshToken.create>[0]> = {},
  ) {
    return {
      userId: 'user-1',
      token: 'valid-token',
      expiresIn: FUTURE,
      ...overrides,
    };
  }

  describe('create()', () => {
    it('should create a valid refresh token', () => {
      expect(RefreshToken.create(makeProps()).isRight()).toBe(true);
    });

    it('should reject empty token', () => {
      expect(RefreshToken.create(makeProps({ token: '' })).isLeft()).toBe(true);
    });

    it('should reject past expiresIn for new tokens (no id)', () => {
      expect(RefreshToken.create(makeProps({ expiresIn: PAST })).isLeft()).toBe(
        true,
      );
    });

    it('should allow past expiresIn when restoring with an id', () => {
      expect(
        RefreshToken.create(
          makeProps({ expiresIn: PAST }),
          'existing-id',
        ).isRight(),
      ).toBe(true);
    });
  });

  describe('isExpired()', () => {
    it('should return false for a future expiration date', () => {
      const token = RefreshToken.create(makeProps()).value as RefreshToken;
      expect(token.isExpired(new Date())).toBe(false);
    });

    it('should return true when reference date is after expiration', () => {
      const token = RefreshToken.create(makeProps({ expiresIn: PAST }), 'id')
        .value as RefreshToken;
      expect(token.isExpired(new Date())).toBe(true);
    });
  });
});
