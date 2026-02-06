import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import {
  AccountBalanceItem,
  FinancialPositionResponse,
} from '../dto/FinancialPositionDTO';

type Request = Pick<TokenPayloadSchema, 'sub'>;
type Response = FinancialPositionResponse;

@Injectable()
export class GetFinancialPositionService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({ sub }: Request): Promise<Response> {
    const accounts = await this.accountRepository.findAllByWorkspaceId(sub);

    const totalBalance = accounts.reduce(
      (sum: number, account) => sum + Number(account.balance),
      0,
    );

    const accountItems: AccountBalanceItem[] = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      icon: account.icon,
      color: account.color,
    }));

    return {
      totalBalance,
      accounts: accountItems,
    };
  }
}
