import { User } from '@modules/user/entities/User';
import { UserNotFoundError } from '@modules/user/errors';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { GetProfileService } from './get-profile.service';

function makeRequest(overrides = {}) {
  return { sub: 'user-1', workspaceId: 'ws-1', ...overrides };
}

function makeUser(): User {
  const result = User.create(
    { name: 'John Doe', email: 'j@j.com', passwordHash: 'hash' },
    'user-1',
  );
  if (result.isLeft()) throw result.value;
  return result.value;
}

describe('GetProfileService', () => {
  let service: GetProfileService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findUniqueById: jest.fn(),
      findUniqueByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    service = new GetProfileService(userRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return left(UserNotFoundError) when user does not exist', async () => {
    userRepository.findUniqueById.mockResolvedValue(null);

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return right with user data on success', async () => {
    const user = makeUser();
    userRepository.findUniqueById.mockResolvedValue(user);

    const result = await service.execute(makeRequest());
    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value).toBe(user);
    expect(userRepository.findUniqueById).toHaveBeenCalledWith('user-1');
  });
});
