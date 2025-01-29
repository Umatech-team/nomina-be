import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateMemberPasswordDTO } from '../dto/UpdateMemberPasswordDTO';
import { UpdateMemberPasswordGateway } from '../gateways/UpdateMemberPassword.gateway';
import { UpdateMemberPasswordService } from '../services/UpdateMemberPassword.service';

@ApiTags('Member')
@Controller('member')
export class UpdateMemberPasswordController {
  constructor(
    private readonly updateMemberGeneralInfosService: UpdateMemberPasswordService,
  ) {}

  @Patch('/update/password')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Body(UpdateMemberPasswordGateway)
    { email, currentPassword, newPassword }: UpdateMemberPasswordDTO,
  ) {
    const result = await this.updateMemberGeneralInfosService.execute({
      email,
      currentPassword,
      newPassword,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
