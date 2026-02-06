import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateUserPasswordDTO } from '../dto/UpdateMemberPasswordDTO';
import { UpdateUserPasswordGateway } from '../gateways/UpdateMemberPassword.gateway';
import { UpdateUserPasswordService } from '../services/UpdateMemberPassword.service';

@ApiTags('User')
@Controller('user')
export class UpdateUserPasswordController {
  constructor(
    private readonly updateUserPasswordService: UpdateUserPasswordService,
  ) {}

  @Patch('/password')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Body(UpdateUserPasswordGateway)
    { email, currentPassword, newPassword }: UpdateUserPasswordDTO,
  ) {
    const result = await this.updateUserPasswordService.execute({
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
