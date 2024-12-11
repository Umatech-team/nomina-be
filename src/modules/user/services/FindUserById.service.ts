import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { User } from '../entities/User';
import { NickNameAlreadyExistsError } from '../errors/NickNameAlreadyExistsError';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { UserRepository } from '../repositories/contracts/UserRepository';

type Request = TokenPayloadSchema;

type Errors = UserNotFoundError;

type Response = {
  user: User;
};

@Injectable()
export class FindUserByIdService implements Service<Request, Errors, Response> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    sub,
  }: Request): Promise<Either<NickNameAlreadyExistsError, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UserNotFoundError());
    }

    return right({
      user,
    });
  }
}
