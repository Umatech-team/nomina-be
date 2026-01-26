import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { MemberPresenter } from '../presenters/Member.presenter';
import { FindMemberByIdService } from '../services/FindMemberById.service';

@ApiTags('Member')
@Controller('member')
export class GetMemberController {
  constructor(private readonly findMemberByIdService: FindMemberByIdService) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedMember() sub: TokenPayloadSchema) {
    const result = await this.findMemberByIdService.execute(sub);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { member } = result.value;

    return MemberPresenter.toHTTP(member);
  }
}
