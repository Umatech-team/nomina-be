import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { DateAddition } from '../contracts/DateAddition';
import { DateVerification } from '../contracts/DateVerification';

@Injectable()
export class DayJs implements DateAddition, DateVerification {
  addDaysInCurrentDate(days: number): Date {
    return dayjs().add(days, 'days').toDate()
  }

  addDayInCurrentDate(): Date {
    return this.addDaysInCurrentDate(1)
  }

  isBefore({
    startDate = new Date(),
    endDate,
  }: {
    startDate?: Date
    endDate: Date
  }): boolean {
    return dayjs(startDate).isBefore(endDate)
  }
}