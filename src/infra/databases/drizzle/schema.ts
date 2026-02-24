import { bigint, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  date: timestamp('date').notNull(),
  type: text('type').notNull(), // 'INCOME' | 'EXPENSE' | 'TRANSFER'
  status: text('status').notNull(), // 'PENDING' | 'COMPLETED'
});
