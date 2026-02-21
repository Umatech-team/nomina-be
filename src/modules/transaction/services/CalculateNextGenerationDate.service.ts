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

        const baseDayOfMonth = baseDate.getDate();
        const nextDayOfMonth = nextDate.getDate();

        if (baseDayOfMonth !== nextDayOfMonth) {
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
}
