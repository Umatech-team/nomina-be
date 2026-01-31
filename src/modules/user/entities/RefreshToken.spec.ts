import { RefreshToken } from './RefreshToken';

describe('RefreshToken Entity', () => {
  it('should create a refresh token with default values', () => {
    const refreshToken = new RefreshToken({
      userId: 1,
      token: 'token',
      expiresIn: new Date(),
    });

    expect(refreshToken.userId).toBe(1);
    expect(refreshToken.token).toBe('token');
    expect(refreshToken.expiresIn).toBeInstanceOf(Date);
    expect(refreshToken.createdAt).toBeInstanceOf(Date);
  });
});
