import { bigint, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  categoryId: text('category_id').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  date: timestamp('date').notNull(),
  type: text('type').notNull(), // 'INCOME' | 'EXPENSE' | 'TRANSFER'
  status: text('status').notNull(), // 'PENDING' | 'COMPLETED'
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'INCOME' | 'EXPENSE'
  isSystemCategory: text('is_system_category').notNull(),
  parentId: text('parent_id'),
});
