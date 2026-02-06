import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { FindAccountByIdDTO } from '../dto/FindAccountByIdDTO';
import { AccountNotFoundError } from '../errors/AccountNotFoundError';
import { AccountRepository } from '../repositories/contracts/AccountRepository';

type Request = FindAccountByIdDTO & Pick<TokenPayloadSchema, 'workspaceId'>;
type Errors = AccountNotFoundError;
type Response = {
  success: boolean;
};

@Injectable()
export class DeleteAccountService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({
    accountId,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const account = await this.accountRepository.findById(accountId);

    if (!account || account.workspaceId !== workspaceId) {
      return left(
        new AccountNotFoundError(
          'Você não tem permissão para deletar esta conta.',
        ),
      );
    }

    await this.accountRepository.delete(accountId);

    return right({
      success: true,
    });
  }
}
