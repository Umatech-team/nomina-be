export abstract class DateVerification {
  abstract isBefore(props: { startDate?: Date; endDate: Date }): boolean
}