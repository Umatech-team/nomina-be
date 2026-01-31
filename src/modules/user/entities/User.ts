import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';
import { InvalidUserError } from '../errors/InvalidUserError';

export interface UserProps {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Optional<
      UserProps,
      'createdAt' | 'updatedAt' | 'phone' | 'avatarUrl'
    >,
    id?: string,
  ): Either<InvalidUserError, User> {
    if (!props.name || props.name.trim().length < 4) {
      return left(
        new InvalidUserError('O nome deve ter no mínimo 4 caracteres.'),
      );
    }

    if (!User.isValidEmail(props.email)) {
      return left(new InvalidUserError('O e-mail informado é inválido.'));
    }

    const userProps: UserProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      phone: props.phone ?? null,
      avatarUrl: props.avatarUrl ?? null,
    };

    const user = new User(userProps, id);
    return right(user);
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    return this.props.avatarUrl ?? null;
  }

  set avatarUrl(avatarUrl: string | null) {
    this.props.avatarUrl = avatarUrl;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
