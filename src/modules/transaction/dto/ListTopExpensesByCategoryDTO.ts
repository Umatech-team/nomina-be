import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber } from 'class-validator';

export class TopExpensesByCategoryDTO {
  @ApiProperty()
  @IsNumber()
  pageSize!: number;

  @ApiProperty()
  @IsDate()
  startDate!: Date;

  @ApiProperty()
  @IsDate()
  endDate!: Date;
}
