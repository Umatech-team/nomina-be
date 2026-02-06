import { Injectable } from '@nestjs/common';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { User } from '../entities/User';
import { EmailAlreadyExistsError } from '../errors/EmailAlreadyExistsError';
import { InvalidUserError } from '../errors/InvalidUserError';
import { UserRepository } from '../repositories/contracts/UserRepository';
import { CreateUserDTO } from '../dto/CreateMemberDTO';

type Request = CreateUserDTO;

type Errors = EmailAlreadyExistsError | InvalidUserError;

type Response = {
  user: User;
};

@Injectable()
export class CreateUserService implements Service<Request, Errors, Response> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
  }: Request): Promise<Either<Errors, Response>> {
    const emailAlreadyExists =
      await this.userRepository.findUniqueByEmail(email);

    if (emailAlreadyExists) {
      return left(new EmailAlreadyExistsError());
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const userOrError = User.create({
      name,
      email,
      passwordHash: hashedPassword,
    });

    if (userOrError.isLeft()) {
      return left(userOrError.value);
    }

    const user = userOrError.value;

    await this.userRepository.create(user);

    return right({
      user,
    });
  }
}
