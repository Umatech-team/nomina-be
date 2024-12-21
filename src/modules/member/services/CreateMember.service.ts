import { Injectable } from '@nestjs/common';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateMemberDTO } from '../dto/CreateMemberDTO';
import { Member } from '../entities/Member';
import { EmailAlreadyExistsError } from '../errors/EmailAlreadyExistsError';
import { MemberRepository } from '../repositories/contracts/MemberRepository';

type Request = CreateMemberDTO;

type Errors = EmailAlreadyExistsError;

type Response = {
  member: Member;
};

@Injectable()
export class CreateMemberService implements Service<Request, Errors, Response> {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
  }: CreateMemberDTO): Promise<Either<Errors, Response>> {
    const emailAlreadyExists =
      await this.memberRepository.findUniqueByEmail(email);

    if (emailAlreadyExists) {
      return left(new EmailAlreadyExistsError());
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const member = new Member({
      name,
      email,
      password: hashedPassword,
    });

    await this.memberRepository.create(member);

    return right({
      member,
    });
  }
}
