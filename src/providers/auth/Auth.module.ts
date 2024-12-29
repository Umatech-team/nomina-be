import { env } from '@infra/env';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { JwtStrategy } from './strategys/jwtStrategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      useFactory() {
        return {
          signOptions: {
            algorithm: 'RS256',
          },
          privateKey: env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
          publicKey: env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
        };
      },
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
