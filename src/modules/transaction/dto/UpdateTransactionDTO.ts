import { IsNumber } from 'class-validator';
import { CreateTransactionDTO } from './CreateTransactionDTO';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionDTO extends CreateTransactionDTO {
  @ApiProperty()
  @IsNumber()
  transactionId!: number;
}
