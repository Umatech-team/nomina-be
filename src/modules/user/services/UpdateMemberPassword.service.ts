import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { HashComparer } from '@providers/cryptography/contracts/HashComparer';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UpdateMemberPasswordDTO } from '../dto/UpdateMemberPasswordDTO';
import { MemberNotFoundError } from '../errors/MemberNotFoundError';
import { WrongCredentialsError } from '../errors/WrongCredentialsError';
import { MemberRepository } from '../repositories/contracts/UserRepository';

type Request = UpdateMemberPasswordDTO & TokenPayloadSchema;

type Errors = MemberNotFoundError | WrongCredentialsError;

type Response = null;

@Injectable()
export class UpdateMemberPasswordService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly hashComparer: HashComparer,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    sub,
    email,
    currentPassword,
    newPassword,
  }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new MemberNotFoundError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      currentPassword,
      member.password,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const hashedPassword = await this.hashGenerator.hash(newPassword);

    member.email = email;
    member.password = hashedPassword;

    await this.memberRepository.update(member);

    return right(null);
  }
}
