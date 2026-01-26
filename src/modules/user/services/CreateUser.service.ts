import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { Injectable } from '@nestjs/common';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateUserDTO } from '../dto/CreateMemberDTO';
import { User } from '../entities/User';
import { EmailAlreadyExistsError } from '../errors/EmailAlreadyExistsError';
import { MemberRepository } from '../repositories/contracts/UserRepository';

type Request = CreateUserDTO;

type Errors = EmailAlreadyExistsError;

type Response = {
  user: User;
};

@Injectable()
export class CreateUserService implements Service<Request, Errors, Response> {
  constructor(
    private readonly userRepository: MemberRepository,
    private readonly transactionRepository: TransactionRepository,
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

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await this.userRepository.create(user);

    return right({
      user,
    });
  }
}
