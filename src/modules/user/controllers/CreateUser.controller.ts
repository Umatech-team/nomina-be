import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateUserGateway } from '../gateways/CreateUser.gateway';
import { CreateUserService } from '../services/CreateUser.service';
import { CreateUserDTO } from '../dto/CreateMemberDTO';

@ApiTags('User')
@Controller('user')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Public()
  @Post()
  @HttpCode(statusCode.CREATED)
  async handle(@Body(CreateUserGateway) body: CreateUserDTO) {
    const result = await this.createUserService.execute(body);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
