import { TransactionMethod, TransactionType } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class TransactionDTO {
  @ApiProperty()
  @IsDate()
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  updatedAt!: Date | null;

  @ApiProperty()
  @IsNumber()
  memberId!: number;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  type!: TransactionType;

  @ApiProperty()
  @IsString()
  method!: TransactionMethod;

  @ApiProperty()
  @IsString()
  description!: string | null;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  subCategory!: string;

  @ApiProperty({ description: 'Valor em centavos' })
  @IsNumber()
  amount!: number; // Agora representa centavos como número inteiro

  @ApiProperty()
  @IsString()
  currency!: string;

  @ApiProperty()
  @IsDate()
  date!: Date;
}
