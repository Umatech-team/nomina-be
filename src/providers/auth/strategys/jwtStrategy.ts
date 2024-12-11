import { env } from '@infra/env';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import z from 'zod';

export const tokenPayloadSchema = z.object({
  sub: z.coerce.number(),
});

export type TokenPayloadSchema = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(env.JWT_PUBLIC_KEY, 'base64'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: TokenPayloadSchema) {
    return tokenPayloadSchema.parse(payload);
  }
}
