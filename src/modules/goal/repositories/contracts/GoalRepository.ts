import { Repository } from '@shared/core/contracts/Repository';
import { Goal } from '../../entities/Goal';

export abstract class GoalRepository implements Repository<Goal> {
  abstract create(data: Goal): Promise<void>;
  abstract findUniqueById(id: number): Promise<Goal | null>;
  abstract update(data: Goal): Promise<void>;
  abstract delete(id: number): Promise<void>;
}
