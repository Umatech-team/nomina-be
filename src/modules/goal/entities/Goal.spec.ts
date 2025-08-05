import { Money } from '@shared/valueObjects/Money';
import { Goal } from './Goal';

describe('Goal', () => {
  const baseProps = {
    memberId: 1,
    title: 'Emergency Fund',
    category: 'Savings',
    targetAmount: 100000, // R$ 1.000,00 em centavos
    currentAmount: 25000, // R$ 250,00 em centavos
    monthlyContribution: 10000, // R$ 100,00 em centavos
  };

  describe('constructor', () => {
    it('deve criar uma meta válida', () => {
      const goal = new Goal(baseProps);

      expect(goal.memberId).toBe(1);
      expect(goal.title).toBe('Emergency Fund');
      expect(goal.category).toBe('Savings');
      expect(goal.targetAmount).toBe(100000);
      expect(goal.currentAmount).toBe(25000);
      expect(goal.monthlyContribution).toBe(10000);
    });

    it('deve definir valores padrão', () => {
      const goal = new Goal(baseProps);

      expect(goal.createdAt).toBeInstanceOf(Date);
      expect(goal.updatedAt).toBeNull();
    });
  });

  describe('valores monetários', () => {
    let goal: Goal;

    beforeEach(() => {
      goal = new Goal(baseProps);
    });

    describe('targetAmount', () => {
      it('deve retornar valor alvo em centavos', () => {
        expect(goal.targetAmount).toBe(100000);
      });

      it('deve retornar valor alvo decimal', () => {
        expect(goal.targetAmountDecimal).toBe(1000);
      });

      it('deve retornar objeto Money do valor alvo', () => {
        const money = goal.targetMoney;
        expect(money).toBeInstanceOf(Money);
        expect(money.cents).toBe(100000);
        expect(money.decimal).toBe(1000);
      });

      it('deve definir valor alvo a partir de decimal', () => {
        goal.setTargetAmountFromDecimal(2000);
        expect(goal.targetAmount).toBe(200000);
        expect(goal.targetAmountDecimal).toBe(2000);
      });

      it('deve lançar erro para valor alvo negativo', () => {
        expect(() => {
          goal.targetAmount = -1000;
        }).toThrow('Valor deve ser um número inteiro não negativo (centavos)');
      });
    });

    describe('currentAmount', () => {
      it('deve retornar valor atual em centavos', () => {
        expect(goal.currentAmount).toBe(25000);
      });

      it('deve retornar valor atual decimal', () => {
        expect(goal.currentAmountDecimal).toBe(250);
      });

      it('deve retornar objeto Money do valor atual', () => {
        const money = goal.currentMoney;
        expect(money).toBeInstanceOf(Money);
        expect(money.cents).toBe(25000);
        expect(money.decimal).toBe(250);
      });

      it('deve definir valor atual a partir de decimal', () => {
        goal.setCurrentAmountFromDecimal(500);
        expect(goal.currentAmount).toBe(50000);
        expect(goal.currentAmountDecimal).toBe(500);
      });
    });

    describe('monthlyContribution', () => {
      it('deve retornar contribuição mensal em centavos', () => {
        expect(goal.monthlyContribution).toBe(10000);
      });

      it('deve retornar contribuição mensal decimal', () => {
        expect(goal.monthlyContributionDecimal).toBe(100);
      });

      it('deve retornar objeto Money da contribuição mensal', () => {
        const money = goal.monthlyContributionMoney;
        expect(money).toBeInstanceOf(Money);
        expect(money.cents).toBe(10000);
        expect(money.decimal).toBe(100);
      });

      it('deve definir contribuição mensal a partir de decimal', () => {
        goal.setMonthlyContributionFromDecimal(150);
        expect(goal.monthlyContribution).toBe(15000);
        expect(goal.monthlyContributionDecimal).toBe(150);
      });
    });
  });

  describe('cálculos', () => {
    let goal: Goal;

    beforeEach(() => {
      goal = new Goal(baseProps);
    });

    it('deve calcular progresso em percentual', () => {
      // 25000 / 100000 = 25%
      expect(goal.progressPercentage).toBe(25);
    });

    it('deve limitar progresso a 100%', () => {
      goal.currentAmount = 150000; // Mais que o alvo
      expect(goal.progressPercentage).toBe(100);
    });

    it('deve retornar 0% para alvo zero', () => {
      goal.targetAmount = 0;
      expect(goal.progressPercentage).toBe(0);
    });

    it('deve calcular valor restante', () => {
      // 100000 - 25000 = 75000
      expect(goal.remainingAmount).toBe(75000);
    });

    it('deve retornar 0 para valor restante se meta já foi atingida', () => {
      goal.currentAmount = 100000;
      expect(goal.remainingAmount).toBe(0);
    });

    it('deve retornar objeto Money do valor restante', () => {
      const remaining = goal.remainingMoney;
      expect(remaining).toBeInstanceOf(Money);
      expect(remaining.cents).toBe(75000);
      expect(remaining.decimal).toBe(750);
    });

    it('deve calcular meses estimados para completar', () => {
      // 75000 / 10000 = 7.5, arredondado para 8 meses
      expect(goal.estimatedMonthsToComplete).toBe(8);
    });

    it('deve retornar null se contribuição mensal é zero', () => {
      goal.monthlyContribution = 0;
      expect(goal.estimatedMonthsToComplete).toBeNull();
    });

    it('deve verificar se meta foi atingida', () => {
      expect(goal.isCompleted).toBe(false);
      
      goal.currentAmount = 100000;
      expect(goal.isCompleted).toBe(true);
      
      goal.currentAmount = 150000; // Mais que o alvo
      expect(goal.isCompleted).toBe(true);
    });
  });

  describe('contribuições', () => {
    let goal: Goal;

    beforeEach(() => {
      goal = new Goal(baseProps);
    });

    it('deve adicionar contribuição', () => {
      const initialAmount = goal.currentAmount;
      goal.addContribution(5000); // R$ 50,00

      expect(goal.currentAmount).toBe(initialAmount + 5000);
      expect(goal.updatedAt).toBeInstanceOf(Date);
    });

    it('deve lançar erro para contribuição não inteira', () => {
      expect(() => {
        goal.addContribution(100.5);
      }).toThrow('Contribuição deve ser um número inteiro positivo (centavos)');
    });

    it('deve lançar erro para contribuição negativa', () => {
      expect(() => {
        goal.addContribution(-1000);
      }).toThrow('Contribuição deve ser um número inteiro positivo (centavos)');
    });

    it('deve lançar erro para contribuição zero', () => {
      expect(() => {
        goal.addContribution(0);
      }).toThrow('Contribuição deve ser um número inteiro positivo (centavos)');
    });
  });

  describe('setters', () => {
    let goal: Goal;

    beforeEach(() => {
      goal = new Goal(baseProps);
    });

    it('deve atualizar título e updatedAt', () => {
      goal.title = 'New Goal';
      expect(goal.title).toBe('New Goal');
      expect(goal.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar categoria e updatedAt', () => {
      goal.category = 'Investment';
      expect(goal.category).toBe('Investment');
      expect(goal.updatedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar memberId e updatedAt', () => {
      goal.memberId = 2;
      expect(goal.memberId).toBe(2);
      expect(goal.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('casos extremos', () => {
    it('deve trabalhar com valores zero', () => {
      const goal = new Goal({
        ...baseProps,
        targetAmount: 0,
        currentAmount: 0,
        monthlyContribution: 0,
      });

      expect(goal.progressPercentage).toBe(0);
      expect(goal.remainingAmount).toBe(0);
      expect(goal.estimatedMonthsToComplete).toBeNull();
      expect(goal.isCompleted).toBe(true); // 0/0 é considerado completo
    });

    it('deve trabalhar com valores grandes', () => {
      const goal = new Goal({
        ...baseProps,
        targetAmount: 999999999, // R$ 9.999.999,99
        currentAmount: 500000000, // R$ 5.000.000,00
        monthlyContribution: 100000, // R$ 1.000,00
      });

      expect(goal.targetAmountDecimal).toBe(9999999.99);
      expect(goal.currentAmountDecimal).toBe(5000000);
      expect(goal.monthlyContributionDecimal).toBe(1000);
      expect(goal.progressPercentage).toBeCloseTo(50, 0);
    });

    it('deve preservar precisão ao converter decimais', () => {
      const goal = new Goal(baseProps);
      
      // Testa problema comum de precisão
      goal.setTargetAmountFromDecimal(0.1 + 0.2);
      expect(goal.targetAmount).toBe(30); // Deve ser exatamente 30 centavos
      expect(goal.targetAmountDecimal).toBe(0.3);
    });
  });
});
