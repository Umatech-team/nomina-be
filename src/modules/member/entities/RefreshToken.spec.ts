import { RefreshToken } from './RefreshToken';

describe('RefreshToken Entity', () => {
  it('should create a refresh token with default values', () => {
    const refreshToken = new RefreshToken({
      memberId: 1,
      token: 'token',
      expiresIn: new Date(),
    });

    expect(refreshToken.memberId).toBe(1);
    expect(refreshToken.token).toBe('token');
    expect(refreshToken.expiresIn).toBeInstanceOf(Date);
    expect(refreshToken.createdAt).toBeInstanceOf(Date);
  });
});
