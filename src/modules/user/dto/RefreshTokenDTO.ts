import { IsDate, IsNumber, IsString } from 'class-validator';

export class RefreshTokenDTO {
  @IsDate()
  createdAt!: Date;

  @IsString()
  token!: string;

  @IsDate()
  expiresIn!: Date;

  @IsNumber()
  userId!: number;
}
