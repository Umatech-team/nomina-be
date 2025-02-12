import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber } from 'class-validator';

export class ListTransactionsDTO {
  @ApiProperty()
  @IsNumber()
  page!: number;

  @ApiProperty()
  @IsNumber()
  pageSize!: number;

  @ApiProperty()
  @IsDate()
  startDate?: Date;

  @ApiProperty()
  @IsDate()
  endDate?: Date;
}
