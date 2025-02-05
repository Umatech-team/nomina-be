import { IsNumber } from 'class-validator';

export class FindTransactionDTO {
  @IsNumber()
  transactionId!: number;
}
