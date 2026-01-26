import { OmitType } from '@nestjs/swagger';
import { SubscriptionDTO } from './SubscriptionDTO';

export class CreateSubscriptionDTO extends OmitType(SubscriptionDTO, [
  'id',
  'userId',
]) {}
