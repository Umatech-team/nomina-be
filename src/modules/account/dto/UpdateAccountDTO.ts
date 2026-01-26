import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AccountDTO } from './AccountDTO';

export class UpdateAccountDTO extends OmitType(AccountDTO, [
  'id',
  'balance',
  'workspaceId',
]) {
  @ApiProperty()
  @IsString()
  accountId!: string;
}
