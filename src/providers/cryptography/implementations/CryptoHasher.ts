import { randomBytes } from 'crypto';
import { HandleHashGenerator } from '../contracts/HandleHashGenerator';

export class CryptoHasher implements HandleHashGenerator {
  async handleHash(): Promise<string> {
    const hash = randomBytes(64).toString('hex');
    return hash;
  }
}
