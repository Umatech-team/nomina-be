import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { LoginUserDTO } from '../dto/LoginMemberDTO';
import { LoginUserGateway } from '../gateways/LoginUser.gateway';
import { TokensPresenter } from '../presenters/Tokens.presenter';
import { LoginUserService } from '../services/LoginUser.service';

@ApiTags('Auth')
@Controller('auth')
export class LoginUserController {
  constructor(private readonly loginUserService: LoginUserService) {}

  @Public()
  @Post('login')
  @HttpCode(statusCode.OK)
  async handle(@Body(LoginUserGateway) body: LoginUserDTO) {
    const result = await this.loginUserService.execute(body);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    return TokensPresenter.toHTTP(result.value);
  }
}
