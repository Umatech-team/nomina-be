import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GoalDTO } from './GoalDTO';
import { IsNumber } from 'class-validator';

export class UpdateGoalDTO extends OmitType(GoalDTO, [
  'createdAt',
  'updatedAt',
  'memberId',
]) {
  @ApiProperty()
  @IsNumber()
  goalId!: number;
}
