import { CashAccount } from './CashAccounts';
import { CheckingAccount } from './CheckingAccount';
import { CreditCard } from './CreditCardAccount';
import { InvestmentAccount } from './InvestmentAccount';

export type AnyAccount =
  | CheckingAccount
  | CashAccount
  | InvestmentAccount
  | CreditCard;
