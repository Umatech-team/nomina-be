import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';
import { UserDTO } from '../dto/UserDTO';

export class User extends AggregateRoot<UserDTO> {
  constructor(
    props: Optional<UserDTO, 'createdAt' | 'updatedAt'>,
    id?: number,
  ) {
    const userProps: UserDTO = {
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      name: props.name,
      password: props.password,
    };

    super(userProps, id);
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get password() {
    return this.props.password;
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  touch() {
    this.props.updatedAt = new Date();
  }
}

// Eventos de domínio
// class PlayerEvent implements DomainEvent {
//   constructor(
//     public readonly playerId: number,
//     public readonly characterId: number,
//   ) {}
// }
