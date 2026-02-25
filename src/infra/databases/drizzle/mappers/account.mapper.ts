import { AccountType } from '@constants/enums';
import * as schema from '@infra/databases/drizzle/schema';
import { Account } from '@modules/account/entities/Account';

type AccountDrizzle = typeof schema.accounts.$inferSelect;
type AccountDrizzleInsert = typeof schema.accounts.$inferInsert;

export class AccountMapper {
  static toDomain(raw: AccountDrizzle): Account {
    const result = Account.create(
      {
        balance: BigInt(raw.balance),
        name: raw.name,
        type: raw.type as AccountType,
        workspaceId: raw.workspaceId,
      },
      raw.id,
    );

    if (result.isLeft()) {
      throw result.value;
    }

    return result.value;
  }

  static toDatabase(entity: Account): AccountDrizzleInsert {
    return {
      id: entity.id,
      balance: Number(entity.balance),
      name: entity.name,
      type: entity.type,
      workspaceId: entity.workspaceId,
    };
  }
}
