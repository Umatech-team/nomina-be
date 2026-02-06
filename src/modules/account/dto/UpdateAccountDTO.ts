import { OmitType } from '@nestjs/swagger';
import { AccountDTO } from './AccountDTO';

export class UpdateAccountDTO extends OmitType(AccountDTO, [
  'id',
  'balance',
  'workspaceId',
]) {}
