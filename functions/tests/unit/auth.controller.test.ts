import { signUp, login } from '../../src/api/controllers/auth.controller';
import { HTTP_STATUS } from '../../src/config/constants';
import { AppError } from '../../src/utils/error.util';

const mockSet = jest.fn();
const mockDoc = jest.fn((docId?: string) => ({ set: mockSet }));
const mockCollection = jest.fn((collectionName?: string) => ({ doc: mockDoc }));

jest.mock('../../src/config/firebase.config', () => ({
  auth: {
    createUser: jest.fn(),
    setCustomUserClaims: jest.fn(),
    getUserByEmail: jest.fn(),
    getUser: jest.fn(),
  },
  db: {
    collection: jest.fn((collectionName: string) => {
      return mockCollection(collectionName);
    }),
  },
}));

jest.mock('../../src/config/env.config', () => ({
  config: {
    identityToolkitApiKey: 'test-key',
  },
}));

const { auth } = jest.requireMock('../../src/config/firebase.config') as {
  auth: {
    createUser: jest.Mock;
    setCustomUserClaims: jest.Mock;
    getUserByEmail: jest.Mock;
    getUser: jest.Mock;
  };
};

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSet.mockReset();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('signUp', () => {
    it('creates a user and returns basic profile', async () => {
      const req: any = {
        body: {
          email: 'test@example.com',
          password: 'Password123',
          displayName: 'Test User',
          role: 'host',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      auth.createUser.mockResolvedValue({
        uid: 'uid123',
        email: 'test@example.com',
        displayName: 'Test User',
      });
      auth.setCustomUserClaims.mockResolvedValue(undefined);

      await signUp(req, res, next);

      expect(auth.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'Password123',
          displayName: 'Test User',
        })
      );
      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockDoc).toHaveBeenCalledWith('uid123');
      expect(mockSet).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              uid: 'uid123',
              email: 'test@example.com',
            }),
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('calls next with AppError for invalid credentials', async () => {
      const req: any = {
        body: {
          email: 'test@example.com',
          password: 'wrong-password',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

      auth.getUserByEmail.mockResolvedValue({
        uid: 'uid123',
        email: 'test@example.com',
        customClaims: {},
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({
          error: {
            message: 'INVALID_PASSWORD',
          },
        }),
      });

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid email or password',
          statusCode: HTTP_STATUS.UNAUTHORIZED,
        }) as AppError
      );
    });
  });
});

