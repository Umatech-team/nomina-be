import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FindTransactionDTO {
  @ApiProperty()
  @IsNumber()
  transactionId!: number;
}
