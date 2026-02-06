import { Subscription } from '@modules/subscription/entities/Subscription';
import { SubscriptionRepository } from '@modules/subscription/repositories/contracts/SubscriptionRepository';
import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { SubscriptionMapper } from './SubscriptionMapper';

@Injectable()
export class SubscriptionRepositoryImplementation
  implements SubscriptionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(subscription: Subscription): Promise<Subscription> {
    const created = await this.prisma.subscription.create({
      data: SubscriptionMapper.toPrisma(subscription),
    });
    return SubscriptionMapper.toEntity(created);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: SubscriptionMapper.toPrisma(subscription),
    });
    return SubscriptionMapper.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscription.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    return subscription ? SubscriptionMapper.toEntity(subscription) : null;
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { currentPeriodEnd: 'desc' }, // Pegar mais recente se houver múltiplas
    });
    return subscription ? SubscriptionMapper.toEntity(subscription) : null;
  }

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: { gte: new Date() }, // Não expirado
      },
    });
    return subscription ? SubscriptionMapper.toEntity(subscription) : null;
  }
}
