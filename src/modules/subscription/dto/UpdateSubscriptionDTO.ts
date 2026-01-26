import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SubscriptionDTO } from './SubscriptionDTO';

export class UpdateSubscriptionDTO extends OmitType(SubscriptionDTO, [
  'id',
  'userId',
]) {
  @ApiProperty()
  @IsString()
  subscriptionId!: string;
}
