import { Entity } from '@shared/core/Entities/Entity';
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
  ): RefreshToken {
    const refreshTokenProps: RefreshTokenProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
    };

    return new RefreshToken(refreshTokenProps, id);
  }

  get userId() {
    return this.props.userId;
  }

  get token() {
    return this.props.token;
  }

  get expiresIn() {
    return this.props.expiresIn;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
