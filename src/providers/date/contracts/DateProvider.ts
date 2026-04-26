export type InvoiceCycleParams = {
  referenceDate: Date;
  closingDay: number;
  dueDay: number;
  timezone: string;
};

export type InvoiceCycle = {
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
};

export abstract class DateProvider {
  abstract now(): Date;
  abstract toTimezone(date: Date, timezone: string): Date;
  abstract calculateInvoiceCycle(params: InvoiceCycleParams): InvoiceCycle;
}
