export const mockRefreshTokenRequest = () => ({
  token: 'mockRefreshToken',
  userId: 'mockUserId',
});

export const mockRefreshTokenResponse = () => ({
  accessToken: 'mockAccessToken',
  refreshToken: 'mockRefreshToken',
});

export const mockErrorResponse = () => ({
  error: 'Invalid refresh token',
});
