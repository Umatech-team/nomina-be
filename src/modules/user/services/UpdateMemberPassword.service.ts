import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { HashComparer } from '@providers/cryptography/contracts/HashComparer';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UpdateUserPasswordDTO } from '../dto/UpdateMemberPasswordDTO';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { WrongCredentialsError } from '../errors/WrongCredentialsError';
import { UserRepository } from '../repositories/contracts/UserRepository';

type Request = UpdateUserPasswordDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = UserNotFoundError | WrongCredentialsError;

type Response = null;

@Injectable()
export class UpdateUserPasswordService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashComparer: HashComparer,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    sub,
    email,
    currentPassword,
    newPassword,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UserNotFoundError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const hashedPassword = await this.hashGenerator.hash(newPassword);

    user.email = email;
    user.passwordHash = hashedPassword;

    await this.userRepository.update(user);

    return right(null);
  }
}
