import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ListRecurringTransactionsDTO {
  @ApiProperty()
  @IsNumber()
  page!: number;

  @ApiProperty()
  @IsNumber()
  pageSize!: number;
}
