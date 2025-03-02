import { Goal } from '@modules/goal/entities/Goal';
import { GoalRepository } from '@modules/goal/repositories/contracts/GoalRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GoalMapper } from './GoalMapper';

@Injectable()
export class GoalRepositoryImplementation implements GoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueById(id: number): Promise<Goal | null> {
    const goal = await this.prisma.goal.findUnique({
      where: {
        id,
      },
    });

    return goal ? GoalMapper.toEntity(goal) : null;
  }

  async create(goal: Goal): Promise<void> {
    await this.prisma.goal.create({
      data: GoalMapper.toPrisma(goal),
    });
  }

  async update(goal: Goal): Promise<void> {
    await this.prisma.goal.update({
      where: {
        id: goal.id as number,
      },
      data: GoalMapper.toPrisma(goal),
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.goal.delete({
      where: {
        id,
      },
    });
  }
}
