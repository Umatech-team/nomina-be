import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateMemberGeneralInfosDTO } from '../dto/UpdateMemberGeneralInfosDTO';
import { UpdateMemberGeneralInfosGateway } from '../gateways/UpdateMemberGeneralInfos.gateway';
import { UpdateMemberGeneralInfosService } from '../services/UpdateMember.service';

@ApiTags('Member')
@Controller('member')
export class UpdateMemberGeneralInfosController {
  constructor(
    private readonly updateMemberGeneralInfosService: UpdateMemberGeneralInfosService,
  ) {}

  @Patch('/update/general-infos')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(UpdateMemberGeneralInfosGateway)
    { currency, email, language, name, phone }: UpdateMemberGeneralInfosDTO,
  ) {
    const result = await this.updateMemberGeneralInfosService.execute({
      currency,
      email,
      language,
      name,
      phone,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
