import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FindGoalByIdDTO {
  @ApiProperty()
  @IsNumber()
  goalId!: number;
}
