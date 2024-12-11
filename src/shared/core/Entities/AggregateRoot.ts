import { DomainEvent } from '../Events/DomainEvent';
import { DomainEvents } from '../Events/DomainEvents';
import { Entity } from './Entity';

export abstract class AggregateRoot<Props> extends Entity<Props> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents() {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents() {
    this._domainEvents = [];
  }
}
