import { ExpensesByCategoryPresenter } from '@modules/report/presenters/ExpensesByCategoryPresenter';
import { GetExpensesByCategoryService } from '@modules/report/services/GetExpensesByCategory.service';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  GetExpensesByCategoryPipe,
  GetExpensesByCategoryRequest,
} from './get-expenses-by-category.dto';

@ApiTags('Report')
@Controller('report')
export class GetExpensesByCategoryController {
  constructor(
    private readonly getExpensesByCategoryService: GetExpensesByCategoryService,
  ) {}

  @Get('expenses-by-category')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId }: TokenPayloadSchema,
    @Query(GetExpensesByCategoryPipe) query: GetExpensesByCategoryRequest,
  ) {
    const result = await this.getExpensesByCategoryService.execute({
      ...query,
      workspaceId,
    });

    return {
      data: ExpensesByCategoryPresenter.toHTTP(result),
    };
  }
}
