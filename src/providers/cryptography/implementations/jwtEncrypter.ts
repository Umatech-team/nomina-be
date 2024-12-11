import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Decoder } from '../contracts/Decoder';
import { Encrypter } from '../contracts/Encrypter';

@Injectable()
export class JwtEncrypter implements Encrypter, Decoder {
  constructor(private readonly jwtService: JwtService) {}

  async encrypt(
    payload: Record<string, unknown>,
    options: JwtSignOptions = { algorithm: 'RS256' },
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, options);
  }

  async decrypt(
    token: string,
    options: JwtSignOptions = {},
  ): Promise<{ payload?: TokenPayloadSchema; isValid: boolean }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, options);

      return { payload, isValid: true };
    } catch (error) {
      console.error('Error decrypting token:', error);
      return { isValid: false };
    }
  }
}
