import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UpdateMemberGeneralInfosDTO } from '../dto/UpdateMemberGeneralInfosDTO';
import { MemberNotFoundError } from '../errors/MemberNotFoundError';
import { MemberRepository } from '../repositories/contracts/UserRepository';

type Request = UpdateMemberGeneralInfosDTO & TokenPayloadSchema;

type Errors = MemberNotFoundError;

type Response = null;

@Injectable()
export class UpdateMemberGeneralInfosService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute({
    sub,
    currency,
    email,
    language,
    name,
    phone,
  }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new MemberNotFoundError());
    }

    member.currency = currency;
    member.email = email;
    member.language = language;
    member.name = name;
    member.phone = phone as string;

    await this.memberRepository.update(member);

    return right(null);
  }
}
