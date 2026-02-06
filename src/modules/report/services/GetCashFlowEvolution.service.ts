import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import {
  CashFlowEvolutionDTO,
  CashFlowReportItem,
} from '../dto/CashFlowEvolutionDTO';

type Request = CashFlowEvolutionDTO & Pick<TokenPayloadSchema, 'sub'>;
type Response = CashFlowReportItem[];

@Injectable()
export class GetCashFlowEvolutionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute({ startDate, endDate, sub }: Request): Promise<Response> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const result = await this.transactionRepository.getCashFlowEvolutionReport(
      sub,
      start,
      end,
    );

    return result;
  }
}
