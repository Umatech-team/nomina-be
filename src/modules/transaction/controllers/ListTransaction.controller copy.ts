import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { TopExpensesByCategoryPresenter } from '../presenters/TopExpensesByCategory.presenter.';
import { ListTopExpensesByCategoryService } from '../services/ListTopExpensesByCategory.service';

@ApiTags('Transaction')
@Controller('transaction/list')
export class TopExpensesByCategoryController {
  constructor(
    private readonly listTransactionService: ListTopExpensesByCategoryService,
  ) {}

  @Get('/top-expenses-by-category')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedMember() { sub }: TokenPayloadSchema,
    @Query('pageSize') pageSize: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const result = await this.listTransactionService.execute({
      pageSize: parseInt(pageSize),
      startDate,
      endDate,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { expenses } = result.value;

    return expenses.map(TopExpensesByCategoryPresenter.toHTTP);
  }
}
