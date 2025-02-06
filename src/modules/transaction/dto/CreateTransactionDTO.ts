import { TransactionType } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDTO {
  @ApiProperty()
  @IsString()
  type!: TransactionType;

  @ApiProperty()
  @IsString()
  description!: string | null;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsString()
  currency!: string;

  @ApiProperty()
  @IsDate()
  date!: Date;
}
