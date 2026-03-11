import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { MonthSummaryPresenter } from '@modules/report/presenters/MonthlySummary.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { FindMonthSummaryHandler } from './get-month-summary.handler';

@ApiTags('Report')
@Controller('report')
export class FindMonthSummaryController {
  constructor(private readonly handler: FindMonthSummaryHandler) {}

  @Get('month-summary')
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema) {
    const data = await this.handler.execute({
      sub,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return MonthSummaryPresenter.toHTTP(data.value);
  }
}
