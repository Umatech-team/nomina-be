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
}
