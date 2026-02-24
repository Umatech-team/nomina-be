import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

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
      {
        name: 'Dividendos',
        type: 'INCOME',
      },
      {
        name: 'Juros',
        type: 'INCOME',
      },
      {
        name: 'Rendimento CDB',
        type: 'INCOME',
      },
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
      {
        name: 'Restaurantes',
        type: 'EXPENSE',
      },
      {
        name: 'Mercado',
        type: 'EXPENSE',
      },
      {
        name: 'Lanche',
        type: 'EXPENSE',
      },
      {
        name: 'Delivery',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Transporte',
    type: 'EXPENSE',
    children: [
      {
        name: 'Combustível',
        type: 'EXPENSE',
      },
      {
        name: 'Uber/99',
        type: 'EXPENSE',
      },
      {
        name: 'Transporte Público',
        type: 'EXPENSE',
      },
      {
        name: 'Estacionamento',
        type: 'EXPENSE',
      },
      {
        name: 'Manutenção',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Moradia',
    type: 'EXPENSE',
    children: [
      {
        name: 'Aluguel',
        type: 'EXPENSE',
      },
      {
        name: 'Condomínio',
        type: 'EXPENSE',
      },
      {
        name: 'IPTU',
        type: 'EXPENSE',
      },
      {
        name: 'Água',
        type: 'EXPENSE',
      },
      {
        name: 'Energia',
        type: 'EXPENSE',
      },
      {
        name: 'Gás',
        type: 'EXPENSE',
      },
      {
        name: 'Internet',
        type: 'EXPENSE',
      },
      {
        name: 'Manutenção',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Saúde',
    type: 'EXPENSE',
    children: [
      {
        name: 'Plano de Saúde',
        type: 'EXPENSE',
      },
      {
        name: 'Consultas',
        type: 'EXPENSE',
      },
      {
        name: 'Medicamentos',
        type: 'EXPENSE',
      },
      {
        name: 'Exames',
        type: 'EXPENSE',
      },
      {
        name: 'Academia',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Educação',
    type: 'EXPENSE',
    children: [
      {
        name: 'Mensalidade',
        type: 'EXPENSE',
      },
      {
        name: 'Cursos',
        type: 'EXPENSE',
      },
      {
        name: 'Materiais',
        type: 'EXPENSE',
      },
      {
        name: 'Livros',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Lazer',
    type: 'EXPENSE',
    children: [
      {
        name: 'Cinema',
        type: 'EXPENSE',
      },
      {
        name: 'Streaming',
        type: 'EXPENSE',
      },
      {
        name: 'Viagens',
        type: 'EXPENSE',
      },
      {
        name: 'Hobbies',
        type: 'EXPENSE',
      },
      {
        name: 'Eventos',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Vestuário',
    type: 'EXPENSE',
    children: [
      {
        name: 'Roupas',
        type: 'EXPENSE',
      },
      {
        name: 'Calçados',
        type: 'EXPENSE',
      },
      {
        name: 'Acessórios',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Beleza',
    type: 'EXPENSE',
    children: [
      {
        name: 'Cabeleireiro',
        type: 'EXPENSE',
      },
      {
        name: 'Cosméticos',
        type: 'EXPENSE',
      },
      {
        name: 'Tratamentos',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Pets',
    type: 'EXPENSE',
    children: [
      {
        name: 'Veterinário',
        type: 'EXPENSE',
      },
      {
        name: 'Ração',
        type: 'EXPENSE',
      },
      {
        name: 'Petshop',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Impostos',
    type: 'EXPENSE',
    children: [
      {
        name: 'IRPF',
        type: 'EXPENSE',
      },
      {
        name: 'IPVA',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Serviços',
    type: 'EXPENSE',
    children: [
      {
        name: 'Contador',
        type: 'EXPENSE',
      },
      {
        name: 'Advogado',
        type: 'EXPENSE',
      },
      {
        name: 'Seguros',
        type: 'EXPENSE',
      },
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

  // Limpar categorias existentes sem workspace (seed categories)
  const deletedCount = await prisma.category.deleteMany({
    where: {
      workspaceId: null,
    },
  });

  console.log(`🧹 Removidas ${deletedCount.count} categorias antigas\n`);

  // Criar categorias
  let totalCreated = 0;

  for (const categoryData of categoriesData) {
    const { children, ...parentData } = categoryData;

    // Criar categoria pai
    const parentCategory = await prisma.category.create({
      data: {
        ...parentData,
        workspaceId: null, // Categorias globais/seed não têm workspace
        isSystemCategory: true, // Marca como categoria do sistema
      },
    });

    console.log(`✅ Criada: ${parentCategory.name} (${parentCategory.type})`);
    totalCreated++;

    // Criar subcategorias se existirem
    if (children && children.length > 0) {
      for (const childData of children) {
        const childCategory = await prisma.category.create({
          data: {
            ...childData,
            workspaceId: null,
            parentId: parentCategory.id,
            isSystemCategory: true, // Marca como categoria do sistema
          },
        });

        console.log(`   ↳ ${childCategory.name}`);
        totalCreated++;
      }
    }
  }

  console.log(
    `\n✨ Seed concluída! Total de ${totalCreated} categorias criadas.`,
  );
  console.log('\n📊 Resumo:');

  const incomeCount = await prisma.category.count({
    where: { type: 'INCOME', workspaceId: null },
  });

  const expenseCount = await prisma.category.count({
    where: { type: 'EXPENSE', workspaceId: null },
  });

  console.log(`   - Receitas: ${incomeCount}`);
  console.log(`   - Despesas: ${expenseCount}`);
  console.log(`   - Total: ${incomeCount + expenseCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
