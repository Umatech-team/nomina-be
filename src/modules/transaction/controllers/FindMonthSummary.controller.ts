import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { MonthSummaryPresenter } from '../presenters/MonthlySummary.presenter';
import { FindMonthSummaryService } from '../services/FindMonthSummary.service';

@ApiTags('Transaction')
@Controller('transaction')
export class FindMonthSummaryController {
  constructor(
    private readonly findMonthSummaryService: FindMonthSummaryService,
  ) {}

  @Get('month-summary')
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema) {
    const result = await this.findMonthSummaryService.execute({
      sub,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { monthSummary } = result.value;

    return MonthSummaryPresenter.toHTTP(monthSummary);
  }
}
