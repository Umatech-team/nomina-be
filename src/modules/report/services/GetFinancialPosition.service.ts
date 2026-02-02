import { PrismaService } from '@infra/databases/prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  async execute({ sub }: Request): Promise<Response> {
    // 1. Fetch all accounts in workspace
    const accounts = await this.prisma.account.findMany({
      where: {
        workspaceId: sub,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        icon: true,
        color: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // 2. Calculate total balance
    const totalBalance = accounts.reduce(
      (sum: number, account) => sum + Number(account.balance),
      0,
    );

    // 3. Map to response format
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
