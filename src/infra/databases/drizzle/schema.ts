import { bigint, boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

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
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'date',
  }).$onUpdate(() => new Date()),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'CASH' | 'CREDIT_CARD' | 'BANK'
  balance: bigint('balance', { mode: 'number' }).notNull(),
});

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const workspaceUsers = pgTable('workspace_users', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  userId: text('user_id').notNull(),
  isDefault: boolean('is_default').notNull(),
  role: text('role').notNull(), // 'OWNER' | 'ADMIN' | 'MEMBER',
  joinedAt: timestamp('joined_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  planId: text('plan_id').notNull(),
  status: text('status').notNull(), // 'ACTIVE' | 'INACTIVE' | 'CANCELED'
  currentPeriodEnd: timestamp('current_period_end', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull(),
  expiresIn: timestamp('expires_in', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});
