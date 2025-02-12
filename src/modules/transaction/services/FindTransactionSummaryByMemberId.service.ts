import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';
import { TransactionSummary } from '../valueObjects/TransactionSummary';

type Request = TokenPayloadSchema & { period: '7d' | '30d' };

type Errors = TransactionNotFoundError | UnauthorizedError;

type Response = {
  summary: TransactionSummary[];
};

@Injectable()
export class FindTransactionSummaryByMemberIdService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({ sub, period }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new TransactionNotFoundError());
    }

    const summary =
      await this.transactionRepository.findTransactionSummaryByMemberId(
        sub,
        period,
      );

    if (!summary) {
      return left(new TransactionNotFoundError());
    }

    return right({
      summary,
    });
  }
}
