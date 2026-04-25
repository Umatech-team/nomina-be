import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import {
    createMockUser,
    createMockUserRepository,
} from '@modules/user/test-helpers/mock-factories';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { GetProfileService } from './get-profile.service';

describe('GetProfileService', () => {
  let service: GetProfileService;
  let userRepository: jest.Mocked<UserRepository>;
  const makeRequest = (
    overrides?: Partial<TokenPayloadBase>,
  ): TokenPayloadBase => ({
    sub: 'user-id-123',
    workspaceId: 'workspace-id-123',
    ...overrides,
  });

  beforeEach(async () => {
    userRepository = createMockUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileService,
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    service = module.get<GetProfileService>(GetProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute()', () => {
    it('should retrieve user profile successfully (Right)', async () => {
      const request = makeRequest();
      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      const result = await service.execute(request);
      expect(result.isRight()).toBe(true);
      expect(userRepository.findUniqueById).toHaveBeenCalledWith(request.sub);
      expect(userRepository.findUniqueById).toHaveBeenCalledTimes(1);

      const user = result.value as User;
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(request.sub);
    });

    it('should return Not Found error (404) when user does not exist (Left)', async () => {
      const request = makeRequest();
      userRepository.findUniqueById.mockResolvedValue(null);
      const result = await service.execute(request);
      expect(result.isLeft()).toBe(true);
      expect(userRepository.findUniqueById).toHaveBeenCalledWith(request.sub);
      const error = result.value as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(404);
      expect(error.message).toContain('User not found');
    });
  });
});
