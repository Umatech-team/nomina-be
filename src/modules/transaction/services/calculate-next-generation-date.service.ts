import { RecurrenceFrequency } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { DateProvider } from '@providers/date/contracts/DateProvider';
import { RecurringTransaction } from '../entities/RecurringTransaction';

@Injectable()
export class CalculateNextGenerationDateService {
  constructor(private readonly dateProvider: DateProvider) {}

  execute(recurring: RecurringTransaction, timezone: string): Date {
    const baseDate = recurring.lastGenerated ?? recurring.startDate;

    switch (recurring.frequency) {
      case RecurrenceFrequency.WEEKLY:
        return this.dateProvider.add(
          baseDate,
          recurring.interval * 7,
          'day',
          timezone,
        );

      case RecurrenceFrequency.MONTHLY:
        return this.dateProvider.add(
          baseDate,
          recurring.interval,
          'month',
          timezone,
        );

      case RecurrenceFrequency.YEARLY:
        return this.dateProvider.add(
          baseDate,
          recurring.interval,
          'year',
          timezone,
        );

      default:
        throw new Error(`Unknown frequency: ${recurring.frequency}`);
    }
  }
}
