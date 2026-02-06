import { AccountType } from '@constants/enums';
import { Account } from '@modules/account/entities/Account';
import { Account as AccountPrisma, Prisma } from '@prisma/client';

export class AccountMapper {
  static toEntity(raw: AccountPrisma): Account {
    return new Account(
      {
        workspaceId: raw.workspaceId,
        name: raw.name,
        type: raw.type as AccountType,
        balance: raw.balance,
        icon: raw.icon,
        color: raw.color,
        closingDay: raw.closingDay,
        dueDay: raw.dueDay,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Account): Prisma.AccountUncheckedCreateInput {
    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      name: entity.name,
      type: entity.type,
      balance: entity.balance,
      icon: entity.icon,
      color: entity.color,
      closingDay: entity.closingDay,
      dueDay: entity.dueDay,
    };
  }
}
