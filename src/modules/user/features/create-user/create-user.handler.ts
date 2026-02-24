import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateUserRequest } from './create-user.dto';

type Request = CreateUserRequest;
type Errors = HttpException;
type Response = User;

@Injectable()
export class CreateUserHandler implements Service<Request, Errors, Response> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    email,
    name,
    password,
  }: Request): Promise<Either<Errors, Response>> {
    const emailAlreadyExists =
      await this.userRepository.findUniqueByEmail(email);

    if (emailAlreadyExists) {
      return left(
        new HttpException('Email already exists', statusCode.CONFLICT),
      );
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
