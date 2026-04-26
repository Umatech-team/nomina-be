import { User } from '@modules/user/entities/User';
import { UserNotFoundError } from '@modules/user/errors';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';

type Request = TokenPayloadBase;

@Injectable()
export class GetProfileService implements Service<Request, Error, User> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ sub }: Request): Promise<Either<Error, User>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UserNotFoundError());
    }

    return right(user);
  }
}
