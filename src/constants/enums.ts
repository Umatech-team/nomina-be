export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  INVESTMENT = 'INVESTMENT',
}

export enum RecurrenceFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
}
