import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { Member } from '../entities/User';
import { EmailAlreadyExistsError } from '../errors/EmailAlreadyExistsError';
import { MemberNotFoundError } from '../errors/MemberNotFoundError';
import { MemberRepository } from '../repositories/contracts/UserRepository';

type Request = TokenPayloadSchema;

type Errors = MemberNotFoundError | EmailAlreadyExistsError;

type Response = {
  member: Member;
};

@Injectable()
export class FindMemberByIdService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute({ sub }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new MemberNotFoundError());
    }

    return right({
      member,
    });
  }
}
