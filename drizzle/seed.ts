import { config } from 'dotenv';
import { isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/infra/databases/drizzle/schema';
import { categories } from '../src/infra/databases/drizzle/schema';
import { env } from '../src/infra/env';

config();

const client = postgres(env.DATABASE_URL);
const db = drizzle(client, { schema });

type TransactionType = 'INCOME' | 'EXPENSE';

interface CategorySeed {
  name: string;
  type: TransactionType;
  children?: string[];
}

interface CategoryInsert {
  name: string;
  type: TransactionType;
  workspaceId: null;
  isSystemCategory: boolean;
}

interface ChildCategoryInsert extends CategoryInsert {
  parentId: string;
}

const categoriesData: CategorySeed[] = [
  { name: 'Salário', type: 'INCOME' },
  { name: 'Freelance', type: 'INCOME' },
  {
    name: 'Investimentos',
    type: 'INCOME',
    children: ['Dividendos', 'Juros', 'Rendimento CDB'],
  },
  { name: 'Vendas', type: 'INCOME' },
  { name: 'Prêmios', type: 'INCOME' },
  { name: 'Reembolsos', type: 'INCOME' },
  { name: 'Outros Ganhos', type: 'INCOME' },
  {
    name: 'Alimentação',
    type: 'EXPENSE',
    children: ['Restaurantes', 'Mercado', 'Lanche', 'Delivery'],
  },
  {
    name: 'Transporte',
    type: 'EXPENSE',
    children: [
      'Combustível',
      'Uber/99',
      'Transporte Público',
      'Estacionamento',
      'Manutenção',
    ],
  },
  {
    name: 'Moradia',
    type: 'EXPENSE',
    children: [
      'Aluguel',
      'Condomínio',
      'IPTU',
      'Água',
      'Energia',
      'Gás',
      'Internet',
      'Manutenção',
    ],
  },
  {
    name: 'Saúde',
    type: 'EXPENSE',
    children: [
      'Plano de Saúde',
      'Consultas',
      'Medicamentos',
      'Exames',
      'Academia',
    ],
  },
  {
    name: 'Educação',
    type: 'EXPENSE',
    children: ['Mensalidade', 'Cursos', 'Materiais', 'Livros'],
  },
  {
    name: 'Lazer',
    type: 'EXPENSE',
    children: ['Cinema', 'Streaming', 'Viagens', 'Hobbies', 'Eventos'],
  },
  {
    name: 'Vestuário',
    type: 'EXPENSE',
    children: ['Roupas', 'Calçados', 'Acessórios'],
  },
  {
    name: 'Beleza',
    type: 'EXPENSE',
    children: ['Cabeleireiro', 'Cosméticos', 'Tratamentos'],
  },
  {
    name: 'Pets',
    type: 'EXPENSE',
    children: ['Veterinário', 'Ração', 'Petshop'],
  },
  {
    name: 'Impostos',
    type: 'EXPENSE',
    children: ['IRPF', 'IPVA'],
  },
  {
    name: 'Serviços',
    type: 'EXPENSE',
    children: ['Contador', 'Advogado', 'Seguros', 'Assinaturas'],
  },
  { name: 'Presentes', type: 'EXPENSE' },
  { name: 'Doações', type: 'EXPENSE' },
  { name: 'Telefonia', type: 'EXPENSE' },
  { name: 'Outros Gastos', type: 'EXPENSE' },
];

async function main(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(categories).where(isNull(categories.workspaceId));

    const parentsToInsert: CategoryInsert[] = categoriesData.map((c) => ({
      name: c.name,
      type: c.type,
      workspaceId: null,
      isSystemCategory: true,
    }));

    const insertedParents = await tx
      .insert(categories)
      .values(parentsToInsert)
      .returning({
        id: categories.id,
        name: categories.name,
        type: categories.type,
      });

    const childrenToInsert: ChildCategoryInsert[] = [];

    for (const parentData of categoriesData) {
      if (parentData.children?.length) {
        const parentRecord = insertedParents.find(
          (p) => p.name === parentData.name && p.type === parentData.type,
        );

        if (!parentRecord) {
          throw new Error(`Parent category not found: ${parentData.name}`);
        }

        for (const childName of parentData.children) {
          childrenToInsert.push({
            name: childName,
            type: parentData.type,
            parentId: parentRecord.id,
            workspaceId: null,
            isSystemCategory: true,
          });
        }
      }
    }

    if (childrenToInsert.length > 0) {
      await tx.insert(categories).values(childrenToInsert);
    }
  });
}

try {
  await main();
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
} finally {
  await client.end();
  process.exit(0);
}
