import { IsDate, IsNumber } from 'class-validator';

export class ListTransactionsDTO {
  @IsDate()
  startDate!: Date;

  @IsDate()
  endDate!: Date;

  @IsNumber()
  page!: number;

  @IsNumber()
  pageSize!: number;
}
