import { TransactionStatus, TransactionType } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';

export class TransactionDTO {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty()
  @IsString()
  accountId!: string;

  @ApiProperty()
  @IsString()
  categoryId!: string | null;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Valor em centavos' })
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsDate()
  date!: Date;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  status!: TransactionStatus;

  @ApiProperty()
  @IsString()
  recurringId!: string | null;

  @ApiProperty()
  @IsDate()
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  updatedAt!: Date | null;
}
