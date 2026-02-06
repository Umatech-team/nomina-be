import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UpdateUserGeneralInfosDTO } from '../dto/UpdateMemberGeneralInfosDTO';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { UserRepository } from '../repositories/contracts/UserRepository';

type Request = UpdateUserGeneralInfosDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = UserNotFoundError;

type Response = null;

@Injectable()
export class UpdateUserGeneralInfosService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    sub,
    email,
    name,
    phone,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UserNotFoundError());
    }

    user.email = email;
    user.name = name;
    user.phone = phone as string;

    await this.userRepository.update(user);

    return right(null);
  }
}
