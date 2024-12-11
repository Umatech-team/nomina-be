import { Module } from '@nestjs/common'
import { DateAddition } from './contracts/DateAddition'
import { DateVerification } from './contracts/DateVerification'
import { DayJs } from './implementations/Dayjs'

@Module({
  providers: [
    {
      provide: DateAddition,
      useClass: DayJs,
    },
    {
      provide: DateVerification,
      useClass: DayJs,
    },
  ],
  exports: [DateAddition, DateVerification],
})
export class DateModule {}