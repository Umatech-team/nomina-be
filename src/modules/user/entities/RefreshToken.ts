import { Entity } from '@shared/core/Entities/Entity';
import { Either, left, right } from '@shared/core/errors/Either';
import { Optional } from '@shared/core/types/Optional';

export interface RefreshTokenProps {
  userId: string;
  token: string;
  expiresIn: Date;
  createdAt: Date;
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Optional<RefreshTokenProps, 'createdAt'>,
    id?: string,
  ): Either<Error, RefreshToken> {
    if (!props.token) return left(new Error('O token não pode ser vazio.'));
    if (!props.expiresIn)
      return left(new Error('A data de expiração é obrigatória.'));

    if (props.expiresIn <= new Date() && !id) {
      return left(new Error('A data de expiração deve estar no futuro.'));
    }

    const refreshTokenProps: RefreshTokenProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
    };

    return right(new RefreshToken(refreshTokenProps, id));
  }

  get userId(): string {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }

  get expiresIn(): Date {
    return this.props.expiresIn;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public isExpired(referenceDate: Date = new Date()): boolean {
    return this.props.expiresIn <= referenceDate;
  }
}
