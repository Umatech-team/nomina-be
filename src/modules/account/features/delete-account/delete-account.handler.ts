import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteAccountRequest } from './delete-account.dto';

type Request = DeleteAccountRequest & Pick<TokenPayloadSchema, 'workspaceId'>;
type Errors = HttpException;
type Response = null;

@Injectable()
export class DeleteAccountHandler
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
        new HttpException(
          'You do not have permission to delete this account or it does not exist',
          statusCode.FORBIDDEN,
        ),
      );
    }

    await this.accountRepository.delete(accountId);

    return right(null);
  }
}
