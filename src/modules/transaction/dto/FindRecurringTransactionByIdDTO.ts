import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindRecurringTransactionByIdDTO {
  @ApiProperty()
  @IsString()
  recurringTransactionId!: string;
}
