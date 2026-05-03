import { AccountType } from '@constants/enums';
import { CheckingAccount } from '@modules/account/entities/CheckingAccount';
import { CreditCard } from '@modules/account/entities/CreditCardAccount';
import {
  AccountNotFoundError,
  AccountTypeError,
} from '@modules/account/errors';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import {
  DateProvider,
  InvoiceCycle,
} from '@providers/date/contracts/DateProvider';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { GetCreditCardInvoiceService } from './get-credit-card-invoice.handler';

type ServiceRequest = Parameters<
  typeof GetCreditCardInvoiceService.prototype.execute
>[0];

function makeRequest(
  overrides: Partial<Record<string, unknown>> = {},
): ServiceRequest {
  return {
    accountId: 'acc-1',
    sub: 'user-1',
    workspaceId: 'ws-1',
    ...overrides,
  } as ServiceRequest;
}

function makeCreditCard(workspaceId = 'ws-1'): CreditCard {
  const r = CreditCard.create(
    {
      workspaceId,
      name: 'My Card',
      timezone: 'America/Sao_Paulo',
      creditLimit: 500000n,
      closingDay: 5,
      dueDay: 15,
    },
    'acc-1',
  );
  if (r.isLeft()) throw r.value;
  return r.value;
}

function makeCheckingAccount(): CheckingAccount {
  const r = CheckingAccount.create(
    {
      workspaceId: 'ws-1',
      name: 'Checking',
      timezone: 'UTC',
      type: AccountType.CHECKING,
      balance: 100000n,
    },
    'acc-2',
  );
  if (r.isLeft()) throw r.value;
  return r.value;
}

describe('GetCreditCardInvoiceService', () => {
  let service: GetCreditCardInvoiceService;
  let accountRepository: jest.Mocked<AccountRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let dateProvider: jest.Mocked<DateProvider>;

  const invoiceCycle: InvoiceCycle = {
    periodStart: new Date('2024-01-06'),
    periodEnd: new Date('2024-02-05'),
    dueDate: new Date('2024-02-15'),
  };

  beforeEach(() => {
    accountRepository = {
      findByNameAndWorkspaceId: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findManyByWorkspaceId: jest.fn(),
      findAllByWorkspaceId: jest.fn(),
      countByWorkspaceId: jest.fn(),
    } as jest.Mocked<AccountRepository>;

    transactionRepository = {
      create: jest.fn(),
      findUniqueById: jest.fn(),
      listTransactionsByWorkspaceId: jest.fn(),
      getTopExpensesByCategory: jest.fn(),
      sumTransactionsByDateRange: jest.fn(),
      createWithBalanceUpdate: jest.fn(),
      updateWithBalanceUpdate: jest.fn(),
      deleteWithBalanceReversion: jest.fn(),
      toggleStatusWithBalanceUpdate: jest.fn(),
      findByAccountAndDateRange: jest.fn(),
    } as jest.Mocked<TransactionRepository>;

    dateProvider = {
      now: jest.fn().mockReturnValue(new Date('2024-01-15')),
      add: jest.fn(),
      format: jest.fn(),
      toTimezone: jest.fn(),
      calculateInvoiceCycle: jest.fn().mockReturnValue(invoiceCycle),
      addDaysInCurrentDate: jest.fn(),
      parse: jest.fn(),
      startOfDay: jest.fn(),
      endOfDay: jest.fn(),
      startOfMonth: jest.fn(),
    } as unknown as jest.Mocked<DateProvider>;

    service = new GetCreditCardInvoiceService(
      accountRepository,
      transactionRepository,
      dateProvider,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should return left(AccountNotFoundError) when account not found', async () => {
    accountRepository.findById.mockResolvedValue(null);

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AccountNotFoundError);
  });

  it('should return left(UnauthorizedError) when account belongs to different workspace', async () => {
    accountRepository.findById.mockResolvedValue(makeCreditCard('ws-other'));

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('should return left(AccountTypeError) when account is not a credit card', async () => {
    accountRepository.findById.mockResolvedValue(makeCheckingAccount());

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AccountTypeError);
  });

  it('should return invoice data on success', async () => {
    accountRepository.findById.mockResolvedValue(makeCreditCard());
    transactionRepository.findByAccountAndDateRange.mockResolvedValue([]);

    const result = await service.execute(makeRequest());
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.account).toBeInstanceOf(CreditCard);
      expect(result.value.transactions).toEqual([]);
      expect(result.value.totalAmount).toBe(0);
      expect(result.value.dueDate).toBe(invoiceCycle.dueDate);
    }
    expect(dateProvider.calculateInvoiceCycle).toHaveBeenCalledWith(
      expect.objectContaining({ closingDay: 5, dueDay: 15 }),
    );
  });

  it('should use closingDay=1 as fallback when account has no closingDay', async () => {
    const cardWithoutClosingDay = CreditCard.create(
      {
        workspaceId: 'ws-1',
        name: 'No Closing Day Card',
        timezone: 'America/Sao_Paulo',
        creditLimit: 500000n,
        closingDay: null,
        dueDay: 15,
      },
      'acc-1',
    );
    if (cardWithoutClosingDay.isLeft()) throw cardWithoutClosingDay.value;

    accountRepository.findById.mockResolvedValue(cardWithoutClosingDay.value);
    transactionRepository.findByAccountAndDateRange.mockResolvedValue([]);

    const result = await service.execute(makeRequest());
    expect(result.isRight()).toBe(true);
    expect(dateProvider.calculateInvoiceCycle).toHaveBeenCalledWith(
      expect.objectContaining({ closingDay: 1 }),
    );
  });
});
