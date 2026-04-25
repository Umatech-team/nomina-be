import { AccountType } from '@constants/enums';
import * as schema from '@infra/databases/drizzle/schema';
import { CashAccount } from '@modules/account/entities/CashAccounts';
import { CheckingAccount } from '@modules/account/entities/CheckingAccount';
import { CreditCard } from '@modules/account/entities/CreditCardAccount';
import { AnyAccount } from '@modules/account/entities/types';
type AccountDrizzle = typeof schema.accounts.$inferSelect;
type AccountDrizzleInsert = typeof schema.accounts.$inferInsert;

export class AccountMapper {
  static toDomain(raw: AccountDrizzle): AnyAccount {
    const baseProps = {
      workspaceId: raw.workspaceId,
      name: raw.name,
      balance: BigInt(raw.balance),
    };

    switch (raw.type) {
      case AccountType.CREDIT_CARD:
        if (
          raw.creditLimit === null ||
          raw.closingDay === null ||
          raw.dueDay === null
        ) {
          throw new Error(
            `Dados corrompidos no banco: Cartão ${raw.id} sem limite/datas.`,
          );
        }
        return CreditCard.reconstitute(
          {
            ...baseProps,
            creditLimit: BigInt(raw.creditLimit),
            closingDay: raw.closingDay,
            dueDay: raw.dueDay,
            timezone: raw.timezone,
          },
          raw.id,
        );

      case AccountType.CHECKING:
        return CheckingAccount.reconstitute(
          {
            ...baseProps,
            type: AccountType.CHECKING,
            timezone: raw.timezone,
          },
          raw.id,
        );

      case AccountType.CASH:
        return CashAccount.reconstitute(
          {
            ...baseProps,
            timezone: raw.timezone,
          },
          raw.id,
        );

      default:
        throw new Error(
          `Tipo de conta desconhecido no banco de dados: ${raw.type}`,
        );
    }
  }

  static toDatabase(entity: AnyAccount): AccountDrizzleInsert {
    const isCreditCard = entity instanceof CreditCard;

    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      name: entity.name,
      type: entity.type,
      balance: Number(entity.balance),
      creditLimit: isCreditCard ? Number(entity.creditLimit) : null,
      closingDay: isCreditCard ? entity.closingDay : null,
      dueDay: isCreditCard ? entity.dueDay : null,
    };
  }
}
