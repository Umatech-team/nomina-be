import { JwtSignOptions } from '@nestjs/jwt';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';

export abstract class Decoder {
  abstract decrypt(
    token: string,
    options?: JwtSignOptions,
  ): Promise<{ payload?: TokenPayloadSchema; isValid: boolean }>;
}
