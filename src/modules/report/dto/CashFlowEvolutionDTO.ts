import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';

export class CashFlowEvolutionDTO {
  @ApiProperty({ example: '2026-01-01' })
  @IsISO8601()
  startDate!: string; // YYYY-MM-DD

  @ApiProperty({ example: '2026-01-31' })
  @IsISO8601()
  endDate!: string; // YYYY-MM-DD
}

export interface CashFlowReportItem {
  date: string; // YYYY-MM-DD
  income: number; // in cents
  expense: number; // in cents
  balance: number; // income - expense (in cents)
}

export type CashFlowEvolutionResponse = CashFlowReportItem[];
