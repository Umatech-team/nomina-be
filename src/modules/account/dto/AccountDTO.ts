import { AccountType } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class AccountDTO {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type!: AccountType;

  @ApiProperty({ description: 'Saldo em centavos' })
  @IsNumber()
  balance!: number;

  @ApiProperty()
  @IsString()
  icon!: string | null;

  @ApiProperty()
  @IsString()
  color!: string | null;

  @ApiProperty()
  @IsNumber()
  closingDay!: number | null;

  @ApiProperty()
  @IsNumber()
  dueDay!: number | null;
}
