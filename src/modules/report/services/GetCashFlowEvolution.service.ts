import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import {
  CashFlowEvolutionDTO,
  CashFlowReportItem,
} from '../dto/CashFlowEvolutionDTO';

type Request = CashFlowEvolutionDTO & Pick<TokenPayloadSchema, 'sub'>;
type Response = CashFlowReportItem[];

@Injectable()
export class GetCashFlowEvolutionService {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ startDate, endDate, sub }: Request): Promise<Response> {
    // 1. Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 2. Fetch all transactions in range
    const transactions = await this.prisma.transaction.findMany({
      where: {
        workspaceId: sub,
        date: {
          gte: start,
          lte: end,
        },
        status: 'COMPLETED',
        type: {
          in: [TransactionType.INCOME, TransactionType.EXPENSE],
        },
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 3. Group by date
    const dailyMap = new Map<string, { income: bigint; expense: bigint }>();

    for (const transaction of transactions) {
      const dateKey = transaction.date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { income: 0n, expense: 0n });
      }

      const daily = dailyMap.get(dateKey)!;

      if (transaction.type === TransactionType.INCOME) {
        daily.income += transaction.amount;
      } else {
        daily.expense += transaction.amount;
      }
    }

    // 4. Convert to array
    const result: CashFlowReportItem[] = Array.from(dailyMap.entries())
      .map(([date, { income, expense }]) => ({
        date,
        income: Number(income),
        expense: Number(expense),
        balance: Number(income - expense),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }
}
