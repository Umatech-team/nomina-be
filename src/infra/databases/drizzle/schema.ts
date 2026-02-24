import { bigint, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  categoryId: text('category_id').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  date: timestamp('date').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'INCOME' | 'EXPENSE'
  isSystemCategory: text('is_system_category').notNull(),
  parentId: text('parent_id'),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
});

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const workspaceUsers = pgTable('workspace_users', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  userId: text('user_id').notNull(),
  role: text('role').notNull(), // 'OWNER' | 'ADMIN' | 'MEMBER'
});
