import { RecurrenceFrequency } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { DayJsDateProvider } from '@providers/date/implementations/Dayjs';
import { RecurringTransaction } from '../entities/RecurringTransaction';

@Injectable()
export class CalculateNextGenerationDateService {
  constructor(private readonly dateProvider: DayJsDateProvider) {}

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
