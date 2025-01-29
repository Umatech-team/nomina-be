import { IsString } from 'class-validator';

export class UpdateMemberGeneralInfosDTO {
  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  phone!: string | null;

  @IsString()
  language!: string;

  @IsString()
  currency!: string;
}
