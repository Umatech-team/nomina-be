import { IsString } from 'class-validator';

export class UpdateMemberPasswordDTO {
  @IsString()
  email!: string;

  @IsString()
  currentPassword!: string;

  @IsString()
  newPassword!: string;
}
