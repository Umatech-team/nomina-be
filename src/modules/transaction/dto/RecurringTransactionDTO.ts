import { RecurrenceFrequency } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsString } from 'class-validator';

export class RecurringTransactionDTO {
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

  @ApiProperty({ enum: RecurrenceFrequency })
  @IsEnum(RecurrenceFrequency)
  frequency!: RecurrenceFrequency;

  @ApiProperty()
  @IsNumber()
  interval!: number;

  @ApiProperty()
  @IsDate()
  startDate!: Date;

  @ApiProperty()
  @IsDate()
  endDate!: Date | null;

  @ApiProperty()
  @IsDate()
  lastGenerated!: Date | null;

  @ApiProperty()
  @IsBoolean()
  active!: boolean;
}
