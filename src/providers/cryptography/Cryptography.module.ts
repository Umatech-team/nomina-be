import { Module } from '@nestjs/common';
import { Decoder } from './contracts/Decoder';
import { Encrypter } from './contracts/Encrypter';
import { HandleHashGenerator } from './contracts/HandleHashGenerator';
import { HashComparer } from './contracts/HashComparer';
import { HashGenerator } from './contracts/HashGenerator';
import { BcryptHasher } from './implementations/BcryptHasher';
import { CryptoHasher } from './implementations/CryptoHasher';
import { JwtEncrypter } from './implementations/jwtEncrypter';

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: Decoder, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: HandleHashGenerator, useClass: CryptoHasher },
  ],
  exports: [
    Encrypter,
    HashComparer,
    HashGenerator,
    Decoder,
    HandleHashGenerator,
  ],
})
export class CryptographyModule {}
