import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { DateAddition } from '../contracts/DateAddition';
import { DateVerification } from '../contracts/DateVerification';

@Injectable()
export class DayJs implements DateAddition, DateVerification {
  addDaysInCurrentDate(days: number): Date {
    return dayjs().add(days, 'days').toDate();
  }

  addYearsInCurrentDate(years: number): Date {
    return dayjs().add(years, 'days').toDate();
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
