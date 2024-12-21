import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { LoginMemberDTO } from '../dto/LoginMemberDTO';
import { LoginMemberGateway } from '../gateways/LoginMember.gateway';
import { TokensPresenter } from '../presenters/Tokens.presenter';
import { LoginMemberService } from '../services/LoginMember.service';

@ApiTags('Auth')
@Controller('member')
export class LoginMemberController {
  constructor(private readonly loginMemberService: LoginMemberService) {}

  @Public()
  @Post('login')
  @HttpCode(statusCode.OK)
  async handle(@Body(LoginMemberGateway) body: LoginMemberDTO) {
    const result = await this.loginMemberService.execute(body);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    return TokensPresenter.toHTTP(result.value);
  }
}
