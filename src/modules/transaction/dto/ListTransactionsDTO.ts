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

  @ApiProperty()
  type?: string;

  @ApiProperty()
  categoryId?: string;

  @ApiProperty()
  accountId?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  status?: string;
}
