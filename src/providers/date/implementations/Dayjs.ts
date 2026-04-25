import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  DateProvider,
  InvoiceCycle,
  InvoiceCycleParams,
} from '../contracts/DateProvider';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class DayJsDateProvider implements DateProvider {
  now(): Date {
    return dayjs().utc().toDate();
  }

  toTimezone(date: Date, timezone: string): Date {
    return dayjs(date).tz(timezone).toDate();
  }

  calculateInvoiceCycle(params: InvoiceCycleParams): InvoiceCycle {
    const { referenceDate, closingDay, dueDay, timezone } = params;

    const anchor = dayjs(referenceDate).tz(timezone);

    const safeClosingDay = Math.min(closingDay, anchor.daysInMonth());
    const periodEnd = anchor.date(safeClosingDay).endOf('day').toDate();

    const previousMonth = anchor.subtract(1, 'month');
    const safePrevClosingDay = Math.min(
      closingDay,
      previousMonth.daysInMonth(),
    );

    const periodStart = previousMonth
      .date(safePrevClosingDay)
      .add(1, 'day')
      .startOf('day')
      .toDate();

    const safeDueDay = Math.min(dueDay, anchor.daysInMonth());
    const dueDate = anchor.date(safeDueDay).startOf('day').toDate();

    return {
      periodStart,
      periodEnd,
      dueDate,
    };
  }

  addDaysInCurrentDate(days: number): Date {
    return dayjs().add(days, 'day').toDate();
  }

  addYearsInCurrentDate(years: number): Date {
    return dayjs().add(years, 'year').toDate();
  }

  isBefore({
    startDate = new Date(),
    endDate,
  }: {
    startDate?: Date;
    endDate: Date;
  }): boolean {
    return dayjs(startDate).isBefore(endDate);
  }
}
