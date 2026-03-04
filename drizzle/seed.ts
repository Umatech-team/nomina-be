import { count } from 'console';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../src/infra/databases/drizzle';
import { categories } from '../src/infra/databases/drizzle/schema';

type TransactionType = 'INCOME' | 'EXPENSE';

interface CategorySeed {
  name: string;
  type: TransactionType;
  children?: Omit<CategorySeed, 'children'>[];
}

const categoriesData: CategorySeed[] = [
  // ========== RECEITAS ==========
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

  // ========== DESPESAS ==========
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
      { name: 'Assinaturas', type: 'EXPENSE' }, // Adicionado
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

async function main() {
  console.log('🌱 Iniciando seed das categorias...\n');

  try {
    await db.transaction(async (tx) => {
      // 1. Limpar categorias existentes do sistema
      const deleted = await tx
        .delete(categories)
        .where(isNull(categories.workspaceId))
        .returning({ id: categories.id });

      console.log(`🧹 Removidas ${deleted.length} categorias antigas\n`);

      // 2. Preparar dados para inserção em lote (Categorias Pai)
      const parentsToInsert = categoriesData.map((c) => ({
        name: c.name,
        type: c.type,
        workspaceId: null,
        isSystemCategory: true,
      }));

      // 3. Inserir todos os pais de uma vez
      const insertedParents = await tx
        .insert(categories)
        .values(parentsToInsert)
        .returning({
          id: categories.id,
          name: categories.name,
          type: categories.type,
        });

      let totalCreated = insertedParents.length;
      const childrenToInsert: Array<{
        name: string;
        type: TransactionType;
        parentId: string; // ou number, dependendo do seu schema
        workspaceId: null;
        isSystemCategory: boolean;
      }> = [];

      // 4. Mapear IDs gerados para construir os filhos
      for (const parentData of categoriesData) {
        if (parentData.children && parentData.children.length > 0) {
          const parentRecord = insertedParents.find(
            (p: { name: string; type: string }) =>
              p.name === parentData.name && p.type === parentData.type,
          );

          if (!parentRecord)
            throw new Error(
              `Falha de consistência: ID não encontrado para ${parentData.name}`,
            );

          for (const childData of parentData.children) {
            childrenToInsert.push({
              name: childData.name,
              type: childData.type as TransactionType,
              parentId: parentRecord.id,
              workspaceId: null,
              isSystemCategory: true,
            });
          }
        }
      }

      // 5. Inserir todos os filhos em lote
      if (childrenToInsert.length > 0) {
        const insertedChildren = await tx
          .insert(categories)
          .values(childrenToInsert)
          .returning({ id: categories.id });

        totalCreated += insertedChildren.length;
      }

      // Feedback no console
      insertedParents.forEach(
        (p: { name: string; type: string; id: string }) => {
          console.log(`✅ Criada: ${p.name} (${p.type})`);
          const children = childrenToInsert.filter((c) => c.parentId === p.id);
          children.forEach((c) => console.log(`   ↳ ${c.name}`));
        },
      );

      console.log(
        `\n✨ Seed concluída! Total de ${totalCreated} categorias criadas.`,
      );
      console.log('\n📊 Resumo:');

      // 6. Contagem validando diretamente no banco
      const [incomeResult] = await tx
        .select({ value: count() })
        .from(categories)
        .where(
          and(eq(categories.type, 'INCOME'), isNull(categories.workspaceId)),
        );

      const [expenseResult] = await tx
        .select({ value: count() })
        .from(categories)
        .where(
          and(eq(categories.type, 'EXPENSE'), isNull(categories.workspaceId)),
        );

      console.log(`   - Receitas: ${incomeResult.value}`);
      console.log(`   - Despesas: ${expenseResult.value}`);
      console.log(
        `   - Total: ${Number(incomeResult.value) + Number(expenseResult.value)}`,
      );
    });
  } catch (error) {
    console.error('❌ Erro durante a transação do seed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e);
    process.exit(1);
  })
  .finally(() => {
    // IMPORTANTE: Feche a conexão do pool aqui.
    // Ex: await connection.end(); ou pool.end();
    process.exit(0);
  });
