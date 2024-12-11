import { IsDate, IsString } from 'class-validator';

export class UserDTO {
  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date | null;

  @IsString()
  name!: string;

  @IsString()
  password!: string;
}
