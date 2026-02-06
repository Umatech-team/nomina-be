import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

interface CategorySeed {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  children?: Omit<CategorySeed, 'children'>[];
}

const categoriesData: CategorySeed[] = [
  // ========== RECEITAS ==========
  {
    name: 'Salário',
    icon: 'briefcase',
    color: '#4CAF50',
    type: 'INCOME',
  },
  {
    name: 'Freelance',
    icon: 'laptop',
    color: '#8BC34A',
    type: 'INCOME',
  },
  {
    name: 'Investimentos',
    icon: 'trending-up',
    color: '#009688',
    type: 'INCOME',
    children: [
      {
        name: 'Dividendos',
        icon: 'dollar-sign',
        color: '#00BCD4',
        type: 'INCOME',
      },
      {
        name: 'Juros',
        icon: 'percent',
        color: '#03A9F4',
        type: 'INCOME',
      },
      {
        name: 'Rendimento CDB',
        icon: 'activity',
        color: '#2196F3',
        type: 'INCOME',
      },
    ],
  },
  {
    name: 'Vendas',
    icon: 'shopping-bag',
    color: '#66BB6A',
    type: 'INCOME',
  },
  {
    name: 'Prêmios',
    icon: 'award',
    color: '#FFC107',
    type: 'INCOME',
  },
  {
    name: 'Reembolsos',
    icon: 'rotate-ccw',
    color: '#FFB300',
    type: 'INCOME',
  },
  {
    name: 'Outros Ganhos',
    icon: 'plus-circle',
    color: '#7CB342',
    type: 'INCOME',
  },

  // ========== DESPESAS ==========
  {
    name: 'Alimentação',
    icon: 'utensils',
    color: '#FF5722',
    type: 'EXPENSE',
    children: [
      {
        name: 'Restaurantes',
        icon: 'coffee',
        color: '#FF6F00',
        type: 'EXPENSE',
      },
      {
        name: 'Mercado',
        icon: 'shopping-cart',
        color: '#F57C00',
        type: 'EXPENSE',
      },
      {
        name: 'Lanche',
        icon: 'sandwich',
        color: '#EF6C00',
        type: 'EXPENSE',
      },
      {
        name: 'Delivery',
        icon: 'truck',
        color: '#E65100',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Transporte',
    icon: 'car',
    color: '#2196F3',
    type: 'EXPENSE',
    children: [
      {
        name: 'Combustível',
        icon: 'droplet',
        color: '#1E88E5',
        type: 'EXPENSE',
      },
      {
        name: 'Uber/99',
        icon: 'navigation',
        color: '#1976D2',
        type: 'EXPENSE',
      },
      {
        name: 'Transporte Público',
        icon: 'bus',
        color: '#1565C0',
        type: 'EXPENSE',
      },
      {
        name: 'Estacionamento',
        icon: 'square',
        color: '#0D47A1',
        type: 'EXPENSE',
      },
      {
        name: 'Manutenção',
        icon: 'tool',
        color: '#0277BD',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Moradia',
    icon: 'home',
    color: '#9C27B0',
    type: 'EXPENSE',
    children: [
      {
        name: 'Aluguel',
        icon: 'key',
        color: '#8E24AA',
        type: 'EXPENSE',
      },
      {
        name: 'Condomínio',
        icon: 'building',
        color: '#7B1FA2',
        type: 'EXPENSE',
      },
      {
        name: 'IPTU',
        icon: 'file-text',
        color: '#6A1B9A',
        type: 'EXPENSE',
      },
      {
        name: 'Água',
        icon: 'droplet',
        color: '#4A148C',
        type: 'EXPENSE',
      },
      {
        name: 'Energia',
        icon: 'zap',
        color: '#6200EA',
        type: 'EXPENSE',
      },
      {
        name: 'Gás',
        icon: 'flame',
        color: '#651FFF',
        type: 'EXPENSE',
      },
      {
        name: 'Internet',
        icon: 'wifi',
        color: '#7C4DFF',
        type: 'EXPENSE',
      },
      {
        name: 'Manutenção',
        icon: 'wrench',
        color: '#B388FF',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Saúde',
    icon: 'heart',
    color: '#E91E63',
    type: 'EXPENSE',
    children: [
      {
        name: 'Plano de Saúde',
        icon: 'shield',
        color: '#D81B60',
        type: 'EXPENSE',
      },
      {
        name: 'Consultas',
        icon: 'user-check',
        color: '#C2185B',
        type: 'EXPENSE',
      },
      {
        name: 'Medicamentos',
        icon: 'pill',
        color: '#AD1457',
        type: 'EXPENSE',
      },
      {
        name: 'Exames',
        icon: 'activity',
        color: '#880E4F',
        type: 'EXPENSE',
      },
      {
        name: 'Academia',
        icon: 'dumbbell',
        color: '#F06292',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Educação',
    icon: 'book',
    color: '#3F51B5',
    type: 'EXPENSE',
    children: [
      {
        name: 'Mensalidade',
        icon: 'graduation-cap',
        color: '#3949AB',
        type: 'EXPENSE',
      },
      {
        name: 'Cursos',
        icon: 'book-open',
        color: '#303F9F',
        type: 'EXPENSE',
      },
      {
        name: 'Materiais',
        icon: 'edit',
        color: '#283593',
        type: 'EXPENSE',
      },
      {
        name: 'Livros',
        icon: 'bookmark',
        color: '#1A237E',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Lazer',
    icon: 'smile',
    color: '#FF9800',
    type: 'EXPENSE',
    children: [
      {
        name: 'Cinema',
        icon: 'film',
        color: '#FB8C00',
        type: 'EXPENSE',
      },
      {
        name: 'Streaming',
        icon: 'tv',
        color: '#F57C00',
        type: 'EXPENSE',
      },
      {
        name: 'Viagens',
        icon: 'plane',
        color: '#EF6C00',
        type: 'EXPENSE',
      },
      {
        name: 'Hobbies',
        icon: 'palette',
        color: '#E65100',
        type: 'EXPENSE',
      },
      {
        name: 'Eventos',
        icon: 'calendar',
        color: '#FFB74D',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Vestuário',
    icon: 'shirt',
    color: '#00BCD4',
    type: 'EXPENSE',
    children: [
      {
        name: 'Roupas',
        icon: 'shopping-bag',
        color: '#00ACC1',
        type: 'EXPENSE',
      },
      {
        name: 'Calçados',
        icon: 'shoe',
        color: '#0097A7',
        type: 'EXPENSE',
      },
      {
        name: 'Acessórios',
        icon: 'watch',
        color: '#00838F',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Beleza',
    icon: 'scissors',
    color: '#E91E63',
    type: 'EXPENSE',
    children: [
      {
        name: 'Cabeleireiro',
        icon: 'user',
        color: '#D81B60',
        type: 'EXPENSE',
      },
      {
        name: 'Cosméticos',
        icon: 'droplet',
        color: '#C2185B',
        type: 'EXPENSE',
      },
      {
        name: 'Tratamentos',
        icon: 'sparkles',
        color: '#AD1457',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Pets',
    icon: 'paw',
    color: '#795548',
    type: 'EXPENSE',
    children: [
      {
        name: 'Veterinário',
        icon: 'stethoscope',
        color: '#6D4C41',
        type: 'EXPENSE',
      },
      {
        name: 'Ração',
        icon: 'package',
        color: '#5D4037',
        type: 'EXPENSE',
      },
      {
        name: 'Petshop',
        icon: 'bath',
        color: '#4E342E',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Impostos',
    icon: 'file-text',
    color: '#607D8B',
    type: 'EXPENSE',
    children: [
      {
        name: 'IRPF',
        icon: 'percent',
        color: '#546E7A',
        type: 'EXPENSE',
      },
      {
        name: 'IPVA',
        icon: 'car',
        color: '#455A64',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Serviços',
    icon: 'briefcase',
    color: '#00897B',
    type: 'EXPENSE',
    children: [
      {
        name: 'Contador',
        icon: 'calculator',
        color: '#00796B',
        type: 'EXPENSE',
      },
      {
        name: 'Advogado',
        icon: 'scale',
        color: '#00695C',
        type: 'EXPENSE',
      },
      {
        name: 'Seguros',
        icon: 'shield',
        color: '#004D40',
        type: 'EXPENSE',
      },
    ],
  },
  {
    name: 'Presentes',
    icon: 'gift',
    color: '#F44336',
    type: 'EXPENSE',
  },
  {
    name: 'Doações',
    icon: 'heart-hand',
    color: '#D32F2F',
    type: 'EXPENSE',
  },
  {
    name: 'Telefonia',
    icon: 'phone',
    color: '#009688',
    type: 'EXPENSE',
  },
  {
    name: 'Outros Gastos',
    icon: 'more-horizontal',
    color: '#757575',
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
