import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserMapper } from './UserMapper';

@Injectable()
export class UserRepositoryImplementation implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user ? UserMapper.toEntity(user) : null;
  }

  async findUniqueByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user ? UserMapper.toEntity(user) : null;
  }

  async create(user: User): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: UserMapper.toPrisma(user),
      });
      const createdWorkspace = await tx.workspace.create({
        data: {
          name: 'Espaço Pessoal',
          currency: 'BRL',
        },
      });
      await tx.subscription.create({
        data: {
          userId: createdUser.id,
          planId: 'weekly_free_trial',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      await tx.workspaceUser.create({
        data: {
          userId: createdUser.id,
          workspaceId: createdWorkspace.id,
          role: 'OWNER',
          isDefault: true,
        },
      });
      await tx.account.create({
        data: {
          name: 'Carteira',
          type: 'CASH',
          balance: 0,
          workspaceId: createdWorkspace.id,
          icon: 'wallet',
        },
      });
    });
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: UserMapper.toPrisma(user),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
