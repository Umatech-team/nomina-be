import { OmitType } from '@nestjs/swagger';
import { GoalDTO } from './GoalDTO';

export class CreateGoalDTO extends OmitType(GoalDTO, [
  'createdAt',
  'updatedAt',
  'memberId',
]) {}
