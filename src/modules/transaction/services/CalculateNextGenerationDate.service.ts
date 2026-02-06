import { RecurrenceFrequency } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { addDays, addMonths, addYears, lastDayOfMonth } from 'date-fns';
import { RecurringTransaction } from '../entities/RecurringTransaction';

@Injectable()
export class CalculateNextGenerationDateService {
  execute(recurring: RecurringTransaction): Date {
    const baseDate = recurring.lastGenerated ?? recurring.startDate;

    let nextDate: Date;

    switch (recurring.frequency) {
      case RecurrenceFrequency.WEEKLY:
        nextDate = addDays(baseDate, 7 * recurring.interval);
        break;

      case RecurrenceFrequency.MONTHLY: {
        nextDate = addMonths(baseDate, recurring.interval);

        // Edge case: Se data base é dia 31 mas próximo mês tem menos dias
        // Ajustar para último dia do mês
        const baseDayOfMonth = baseDate.getDate();
        const nextDayOfMonth = nextDate.getDate();

        if (baseDayOfMonth !== nextDayOfMonth) {
          // addMonths já ajustou automaticamente, mas garantir último dia
          nextDate = lastDayOfMonth(nextDate);
        }
        break;
      }

      case RecurrenceFrequency.YEARLY:
        nextDate = addYears(baseDate, recurring.interval);
        break;

      default:
        throw new Error(`Unknown frequency: ${recurring.frequency}`);
    }

    return nextDate;
  }

  // Helper: Verificar se precisa gerar hoje
  needsGeneration(
    recurring: RecurringTransaction,
    referenceDate: Date,
  ): boolean {
    const nextDate = this.execute(recurring);

    // Gerar se nextDate <= referenceDate e ainda não passou endDate
    if (nextDate > referenceDate) return false;

    if (recurring.endDate && nextDate > recurring.endDate) return false;

    return true;
  }
}
