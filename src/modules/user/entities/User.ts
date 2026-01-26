import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Optional } from '@shared/core/types/Optional';
import { UserDTO } from '../dto/UserDTO';

export class User extends AggregateRoot<UserDTO> {
  constructor(
    props: Optional<UserDTO, 'createdAt' | 'updatedAt' | 'phone' | 'avatarUrl'>,
    id?: string,
  ) {
    const userProps: UserDTO = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      phone: props.phone ?? null,
      avatarUrl: props.avatarUrl ?? null,
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

  get email() {
    return this.props.email;
  }

  set email(email: string) {
    this.props.email = email;
    this.touch();
  }

  get phone(): string | null {
    return this.props.phone ?? null;
  }

  set phone(phone: string | null) {
    this.props.phone = phone;
    this.touch();
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  set passwordHash(passwordHash: string) {
    this.props.passwordHash = passwordHash;
    this.touch();
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  set avatarUrl(avatarUrl: string | null) {
    this.props.avatarUrl = avatarUrl;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
