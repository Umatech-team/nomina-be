import { AccountType } from '@constants/enums';
import * as schema from '@infra/databases/drizzle/schema';
import { Account } from '@modules/account/entities/Account';

type AccountDrizzle = typeof schema.accounts.$inferSelect;
type AccountDrizzleInsert = typeof schema.accounts.$inferInsert;

export class AccountMapper {
  static toDomain(raw: AccountDrizzle): Account {
    return new Account(
      {
        balance: BigInt(raw.balance),
        name: raw.name,
        type: raw.type as AccountType,
        workspaceId: raw.workspaceId,
        icon: raw.icon ?? null,
        color: raw.color ?? null,
        closingDay: raw.closingDay ?? null,
        dueDay: raw.dueDay ?? null,
      },
      raw.id,
    );
  }

  static toDatabase(entity: Account): AccountDrizzleInsert {
    return {
      id: entity.id,
      balance: Number(entity.balance),
      name: entity.name,
      type: entity.type,
      workspaceId: entity.workspaceId,
      icon: entity.icon,
      color: entity.color,
      closingDay: entity.closingDay,
      dueDay: entity.dueDay,
    };
  }
}
