import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateUserPipe, type CreateUserRequest } from './create-user.dto';
import { CreateUserHandler } from './create-user.handler';

@ApiTags('User')
@Controller('user')
export class CreateUserController {
  constructor(private readonly handler: CreateUserHandler) {}

  @Public()
  @Post()
  @HttpCode(statusCode.CREATED)
  async handle(@Body(CreateUserPipe) body: CreateUserRequest) {
    const result = await this.handler.execute(body);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
