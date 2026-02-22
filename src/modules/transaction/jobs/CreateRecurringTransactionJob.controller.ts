import { Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiKey } from '@providers/auth/decorators/ApiKey.decorator';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { GenerateRecurringTransactionsJobService } from './GenerateRecurringTransactionsJob.service';
@ApiTags('Recurring Transaction')
@Controller('internal')
export class GenerateRecurringTransactionJobController {
  constructor(
    private readonly createService: GenerateRecurringTransactionsJobService,
  ) {}

  @Public()
  @Post('generate-recurring-transactions')
  @HttpCode(statusCode.OK)
  async handle(@ApiKey() apiKey: string) {
    if (apiKey !== process.env.CRON_API_KEY) {
      console.log(
        'Received API key:',
        apiKey,
        'Expected API key:',
        process.env.CRON_API_KEY,
      );
      console.log('Invalid API key for generate-recurring-transactions job');
      return;
    }
    const result = await this.createService.execute();

    if (result.isLeft()) {
      console.error(
        'Error executing GenerateRecurringTransactionsJobService:',
        result.value,
      );
      return;
    }

    const { generatedCount } = result.value;

    console.log(
      `GenerateRecurringTransactionsJobService completed. Generated ${generatedCount} transactions.`,
    );
  }
}

/**
 * Exemplo de cURL para testar a rota interna de geração de transações recorrentes:
 *
 * Substitua <SUA_API_KEY> pela chave definida em process.env.CRON_API_KEY.
 *
 * curl -X POST http://localhost:3000/internal/generate-recurring-transactions \
 *   -H "x-api-key: <SUA_API_KEY>"
 */
