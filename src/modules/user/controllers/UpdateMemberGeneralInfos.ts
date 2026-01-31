import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateUserGeneralInfosDTO } from '../dto/UpdateMemberGeneralInfosDTO';
import { UpdateUserGeneralInfosGateway } from '../gateways/UpdateMemberGeneralInfos.gateway';
import { UpdateUserGeneralInfosService } from '../services/UpdateMember.service';

@ApiTags('User')
@Controller('user')
export class UpdateUserGeneralInfosController {
  constructor(
    private readonly updateUserGeneralInfosService: UpdateUserGeneralInfosService,
  ) {}

  @Patch()
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Body(UpdateUserGeneralInfosGateway)
    { email, name, phone }: UpdateUserGeneralInfosDTO,
  ) {
    const result = await this.updateUserGeneralInfosService.execute({
      email,
      name,
      phone,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
