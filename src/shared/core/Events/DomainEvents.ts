import { AggregateRoot } from '../Entities/AggregateRoot';
import { DomainEvent } from './DomainEvent';

export class DomainEvents {
  private static aggregateIdToDispatch: Record<string, DomainEvent[]> = {};

  public static markAggregateForDispatch(
    aggregate: AggregateRoot<unknown>,
  ): void {
    const aggregateId = aggregate.id.toString();
    const events = aggregate.domainEvents;

    if (!this.aggregateIdToDispatch[aggregateId]) {
      this.aggregateIdToDispatch[aggregateId] = [];
    }

    this.aggregateIdToDispatch[aggregateId].push(...events);

    aggregate.clearEvents();
  }

  public static dispatchEventsForAggregate(aggregateId: string): void {
    const events = this.aggregateIdToDispatch[aggregateId];

    if (events) {
      events.forEach((event) => {
        console.log(`Dispatching event: ${event.constructor.name}`);
      });

      delete this.aggregateIdToDispatch[aggregateId];
    }
  }
}
