import { JwtVerifyOptions } from '@nestjs/jwt';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';

export abstract class Decoder {
  abstract decrypt(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<{ payload?: TokenPayloadSchema; isValid: boolean }>;
}
