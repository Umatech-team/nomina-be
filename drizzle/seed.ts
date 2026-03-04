import { config } from 'dotenv';
import { isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/infra/databases/drizzle/schema';
import { categories } from '../src/infra/databases/drizzle/schema';

config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

type TransactionType = 'INCOME' | 'EXPENSE';

interface CategorySeed {
  name: string;
  type: TransactionType;
  children?: Omit<CategorySeed, 'children'>[];
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
  {
    name: 'Salário',
    type: 'INCOME',
  },
  {
    name: 'Freelance',
    type: 'INCOME',
  },
  {
    name: 'Investimentos',
    type: 'INCOME',
    children: [
      { name: 'Dividendos', type: 'INCOME' },
      { name: 'Juros', type: 'INCOME' },
      { name: 'Rendimento CDB', type: 'INCOME' },
    ],
  },
  {
    name: 'Vendas',
    type: 'INCOME',
  },
  {
    name: 'Prêmios',
    type: 'INCOME',
  },
  {
    name: 'Reembolsos',
    type: 'INCOME',
  },
  {
    name: 'Outros Ganhos',
    type: 'INCOME',
  },
  {
    name: 'Alimentação',
    type: 'EXPENSE',
    children: [
      { name: 'Restaurantes', type: 'EXPENSE' },
      { name: 'Mercado', type: 'EXPENSE' },
      { name: 'Lanche', type: 'EXPENSE' },
      { name: 'Delivery', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Transporte',
    type: 'EXPENSE',
    children: [
      { name: 'Combustível', type: 'EXPENSE' },
      { name: 'Uber/99', type: 'EXPENSE' },
      { name: 'Transporte Público', type: 'EXPENSE' },
      { name: 'Estacionamento', type: 'EXPENSE' },
      { name: 'Manutenção', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Moradia',
    type: 'EXPENSE',
    children: [
      { name: 'Aluguel', type: 'EXPENSE' },
      { name: 'Condomínio', type: 'EXPENSE' },
      { name: 'IPTU', type: 'EXPENSE' },
      { name: 'Água', type: 'EXPENSE' },
      { name: 'Energia', type: 'EXPENSE' },
      { name: 'Gás', type: 'EXPENSE' },
      { name: 'Internet', type: 'EXPENSE' },
      { name: 'Manutenção', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Saúde',
    type: 'EXPENSE',
    children: [
      { name: 'Plano de Saúde', type: 'EXPENSE' },
      { name: 'Consultas', type: 'EXPENSE' },
      { name: 'Medicamentos', type: 'EXPENSE' },
      { name: 'Exames', type: 'EXPENSE' },
      { name: 'Academia', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Educação',
    type: 'EXPENSE',
    children: [
      { name: 'Mensalidade', type: 'EXPENSE' },
      { name: 'Cursos', type: 'EXPENSE' },
      { name: 'Materiais', type: 'EXPENSE' },
      { name: 'Livros', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Lazer',
    type: 'EXPENSE',
    children: [
      { name: 'Cinema', type: 'EXPENSE' },
      { name: 'Streaming', type: 'EXPENSE' },
      { name: 'Viagens', type: 'EXPENSE' },
      { name: 'Hobbies', type: 'EXPENSE' },
      { name: 'Eventos', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Vestuário',
    type: 'EXPENSE',
    children: [
      { name: 'Roupas', type: 'EXPENSE' },
      { name: 'Calçados', type: 'EXPENSE' },
      { name: 'Acessórios', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Beleza',
    type: 'EXPENSE',
    children: [
      { name: 'Cabeleireiro', type: 'EXPENSE' },
      { name: 'Cosméticos', type: 'EXPENSE' },
      { name: 'Tratamentos', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Pets',
    type: 'EXPENSE',
    children: [
      { name: 'Veterinário', type: 'EXPENSE' },
      { name: 'Ração', type: 'EXPENSE' },
      { name: 'Petshop', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Impostos',
    type: 'EXPENSE',
    children: [
      { name: 'IRPF', type: 'EXPENSE' },
      { name: 'IPVA', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Serviços',
    type: 'EXPENSE',
    children: [
      { name: 'Contador', type: 'EXPENSE' },
      { name: 'Advogado', type: 'EXPENSE' },
      { name: 'Seguros', type: 'EXPENSE' },
      { name: 'Assinaturas', type: 'EXPENSE' },
    ],
  },
  {
    name: 'Presentes',
    type: 'EXPENSE',
  },
  {
    name: 'Doações',
    type: 'EXPENSE',
  },
  {
    name: 'Telefonia',
    type: 'EXPENSE',
  },
  {
    name: 'Outros Gastos',
    type: 'EXPENSE',
  },
];

async function main(): Promise<void> {
  try {
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

          for (const childData of parentData.children) {
            childrenToInsert.push({
              name: childData.name,
              type: childData.type,
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
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
    process.exit(0);
  });
