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
        if (raw.dueDay === null) {
          throw new Error(
            `Dados corrompidos no banco: Cartão ${raw.id} sem dia de vencimento.`,
          );
        }
        return CreditCard.reconstitute(
          {
            ...baseProps,
            creditLimit: raw.creditLimit !== null ? BigInt(raw.creditLimit) : null,
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
        console.warn(
          `Tipo de conta não suportado encontrado no banco: ${raw.type} (id: ${raw.id}). Tratando como conta corrente.`,
        );
        return CheckingAccount.reconstitute(
          {
            ...baseProps,
            type: AccountType.CHECKING,
            timezone: raw.timezone,
          },
          raw.id,
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
      creditLimit: isCreditCard
        ? entity.creditLimit !== null
          ? Number(entity.creditLimit)
          : null
        : null,
      closingDay: isCreditCard ? entity.closingDay : null,
      dueDay: isCreditCard ? entity.dueDay : null,
    };
  }
}
