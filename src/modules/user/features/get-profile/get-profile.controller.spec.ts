import { UserRole } from '@constants/enums';
import { createMockUser } from '@modules/user/test-helpers/mock-factories';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { GetProfileController } from './get-profile.controller';
import { GetProfileHandler } from './get-profile.handler';

// IMPORTANTE: Estou assumindo que o seu Controller usa um Presenter para retornar { data: ... }
// Se você não usa um Presenter, apenas remova a validação de formato.

describe('GetProfileController', () => {
  let controller: GetProfileController;
  let handler: jest.Mocked<GetProfileHandler>;

  // 1. FACTORY: Centraliza o Payload do Token
  const makeTokenPayload = (
    overrides?: Partial<TokenPayloadSchema>,
  ): TokenPayloadSchema => ({
    sub: 'user-id-123',
    workspaceId: 'workspace-id-123',
    role: UserRole.OWNER,
    ...overrides,
  });

  beforeEach(async () => {
    const mockHandler = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetProfileController],
      providers: [{ provide: GetProfileHandler, useValue: mockHandler }],
    }).compile();

    controller = module.get<GetProfileController>(GetProfileController);
    handler = module.get(GetProfileHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle()', () => {
    it('should route token payload to handler and return formatted data on success (Right)', async () => {
      const payload = makeTokenPayload();
      const mockUser = createMockUser({
        name: 'John Doe',
        email: 'john@example.com',
      });
      handler.execute.mockResolvedValue(right(mockUser));
      const result = await controller.handle(payload);
      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({ sub: payload.sub }),
      );

      expect(result).toHaveProperty('data');
      expect(result.data).toBeDefined();
    });

    it.each([
      [
        'Not Found (404)',
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      ],
      [
        'Internal Server Error (500)',
        new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR),
      ],
    ])(
      'should throw HTTP exception when handler returns error %s (Left)',
      async (_, errorInstance) => {
        const payload = makeTokenPayload();
        handler.execute.mockResolvedValue(left(errorInstance));
        await expect(controller.handle(payload)).rejects.toThrow(errorInstance);
        expect(handler.execute).toHaveBeenCalledWith(
          expect.objectContaining({ sub: payload.sub }),
        );
      },
    );
  });
});
