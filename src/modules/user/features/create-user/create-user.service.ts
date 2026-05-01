import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { Injectable } from '@nestjs/common';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateUserRequest } from './create-user.dto';
import { EmailAlreadyInUseError } from '@modules/user/errors';

type Request = CreateUserRequest;

@Injectable()
export class CreateUserService implements Service<Request, Error, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    email,
    name,
    password,
  }: Request): Promise<Either<Error, User>> {
    const emailAlreadyExists =
      await this.userRepository.findUniqueByEmail(email);

    if (emailAlreadyExists) {
      return left(new EmailAlreadyInUseError());
    }
    const hashedPassword = await this.hashGenerator.hash(password);

    const userOrError = User.create(
      {
        name,
        email,
        passwordHash: hashedPassword,
      },
      crypto.randomUUID(),
    );

    if (userOrError.isLeft()) {
      return left(userOrError.value);
    }

    const user = userOrError.value;

    await this.userRepository.create(user);

    return right(user);
  }
}
