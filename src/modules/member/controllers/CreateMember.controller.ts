import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateMemberDTO } from '../dto/CreateMemberDTO';
import { CreateMemberGateway } from '../gateways/CreateMember.gateway';
import { CreateMemberService } from '../services/CreateMember.service';

@ApiTags('Auth')
@Controller('member')
export class CreateMemberController {
  constructor(private readonly createMemberService: CreateMemberService) {}

  @Public()
  @Post('create')
  @HttpCode(statusCode.CREATED)
  async handle(@Body(CreateMemberGateway) body: CreateMemberDTO) {
    const result = await this.createMemberService.execute(body);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
