import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AccountMapper } from './AccountMapper';

@Injectable()
export class AccountRepositoryImplementation implements AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByNameAndWorkspaceId(
    name: string,
    workspaceId: string,
  ): Promise<Account | null> {
    const account = await this.prisma.account.findFirst({
      where: {
        name,
        workspaceId,
      },
    });

    if (!account) {
      return null;
    }

    return AccountMapper.toEntity(account);
  }

  async create(account: Account): Promise<Account> {
    const createdAccount = await this.prisma.account.create({
      data: AccountMapper.toPrisma(account),
    });

    return AccountMapper.toEntity(createdAccount);
  }

  async findById(accountId: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });

    if (!account) {
      return null;
    }

    return AccountMapper.toEntity(account);
  }

  async update(account: Account): Promise<Account> {
    const updatedAccount = await this.prisma.account.update({
      where: {
        id: account.id,
      },
      data: AccountMapper.toPrisma(account),
    });

    return AccountMapper.toEntity(updatedAccount);
  }

  async delete(accountId: string): Promise<void> {
    await this.prisma.account.delete({
      where: {
        id: accountId,
      },
    });
  }

  async findManyByWorkspaceId(
    workspaceId: string,
    page: number,
    pageSize: number,
  ): Promise<{ accounts: Account[]; total: number }> {
    const [accounts, total] = await Promise.all([
      this.prisma.account.findMany({
        where: {
          workspaceId,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.account.count({
        where: {
          workspaceId,
        },
      }),
    ]);

    return {
      accounts: accounts.map(AccountMapper.toEntity),
      total,
    };
  }

  async findAllByWorkspaceId(workspaceId: string): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return accounts.map(AccountMapper.toEntity);
  }
}
