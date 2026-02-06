import { OmitType } from '@nestjs/swagger';
import { AccountDTO } from './AccountDTO';

export class CreateAccountDTO extends OmitType(AccountDTO, [
  'id',
  'balance',
  'workspaceId',
]) {}
