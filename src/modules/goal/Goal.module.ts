import { DatabaseModule } from '@infra/databases/Database.module';
import { MemberModule } from '@modules/member/Member.module';
import { Module } from '@nestjs/common';
import { CreateGoalController } from './controllers/CreateGoal.controller';
import { FindGoalController } from './controllers/FindGoal.controller';
import { UpdateGoalController } from './controllers/UpdateGoal';
import { CreateGoalService } from './services/CreateGoal.service';
import { FindGoalByIdService } from './services/FindGoalById.service';
import { UpdateGoalService } from './services/UpdateTransaction.service';

@Module({
  controllers: [CreateGoalController, FindGoalController, UpdateGoalController],
  imports: [DatabaseModule, MemberModule],
  providers: [CreateGoalService, FindGoalByIdService, UpdateGoalService],
})
export class GoalModule {}
