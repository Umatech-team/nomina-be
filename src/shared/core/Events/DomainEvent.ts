export interface DomainEvent {
  ocurredAt: Date;
  getAggregateId(): number;
}
