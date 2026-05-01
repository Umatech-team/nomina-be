import { Module } from '@nestjs/common';
import { DateProvider } from './contracts/DateProvider';
import { DayJsDateProvider } from './implementations/Dayjs';

@Module({
  providers: [
    {
      provide: DateProvider,
      useClass: DayJsDateProvider,
    },
  ],
  exports: [DateProvider],
})
export class DateModule {}
