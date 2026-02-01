import { TransactionType } from '@constants/enums';

export const DEFAULT_CATEGORIES = [
  // DESPESAS
  {
    name: 'Alimentação',
    type: TransactionType.EXPENSE,
  },
  {
    name: 'Transporte',
    type: TransactionType.EXPENSE,
  },
  {
    name: 'Moradia',
    type: TransactionType.EXPENSE,
  },
  {
    name: 'Lazer',
    type: TransactionType.EXPENSE,
  },
  {
    name: 'Saúde',
    type: TransactionType.EXPENSE,
  },
  {
    name: 'Educação',
    type: TransactionType.EXPENSE,
  },
  {
    name: 'Compras',
    type: TransactionType.EXPENSE,
  },

  // RECEITAS
  {
    name: 'Salário',
    type: TransactionType.INCOME,
  },
  {
    name: 'Investimentos',
    type: TransactionType.INCOME,
  },
  {
    name: 'Freelance',
    type: TransactionType.INCOME,
  },
];
