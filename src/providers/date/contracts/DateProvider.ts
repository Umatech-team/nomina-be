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

export interface DateProvider {
  now(): Date;
  toTimezone(date: Date, timezone: string): Date;
  calculateInvoiceCycle(params: InvoiceCycleParams): InvoiceCycle;
}
