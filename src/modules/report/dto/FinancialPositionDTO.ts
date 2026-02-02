import { AccountType } from '@prisma/client';

export class FinancialPositionDTO {
  // No input parameters - uses current logged user's workspace
}

export interface AccountBalanceItem {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // in cents
  icon: string | null;
  color: string | null;
}

export interface FinancialPositionResponse {
  totalBalance: number; // Sum of all accounts (in cents)
  accounts: AccountBalanceItem[];
}
