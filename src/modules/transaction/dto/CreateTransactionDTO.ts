import { TransactionType } from '@constants/enums';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDTO {
  @IsString()
  type!: TransactionType;

  @IsString()
  description!: string | null;

  @IsString()
  category!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  currency!: string;

  @IsDate()
  date!: Date;
}
