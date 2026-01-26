export class TokensPresenter {
  static toHTTP({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    return {
      accessToken,
      refreshToken,
    };
  }
}
