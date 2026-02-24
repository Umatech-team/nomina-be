import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  GetExpensesByCategoryPipe,
  GetExpensesByCategoryRequest,
} from './get-expenses-by-category.dto';
import { GetExpensesByCategoryHandler } from './get-expenses-by-category.handler';

@ApiTags('Report')
@Controller('report')
export class GetExpensesByCategoryController {
  constructor(private readonly handler: GetExpensesByCategoryHandler) {}

  @Get('expenses-by-category')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Query(GetExpensesByCategoryPipe) query: GetExpensesByCategoryRequest,
  ) {
    const data = await this.handler.execute({
      ...query,
      workspaceId,
    });

    return { data };
  }
}
