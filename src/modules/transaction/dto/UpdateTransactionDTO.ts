import { IsNumber } from 'class-validator';
import { CreateTransactionDTO } from './CreateTransactionDTO';

export class UpdateTransactionDTO extends CreateTransactionDTO {
  @IsNumber()
  transactionId!: number;
}
