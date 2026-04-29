import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

type RoleValue = 'CUSTOMER' | 'MANAGER';

type RequestUser = {
  id: string;
  role: RoleValue;
};

type RequestWithUser = {
  user: RequestUser;
};

type FeedbackServiceMock = Pick<
  FeedbackService,
  | 'createFeedback'
  | 'getMyFeedbacks'
  | 'getFeedbackById'
  | 'updateFeedback'
  | 'getAllFeedbacks'
  | 'getHighPriorityFeedbacks'
  | 'getPendingCount'
>;

const mockFeedbackService: jest.Mocked<FeedbackServiceMock> = {
  createFeedback: jest.fn(),
  getMyFeedbacks: jest.fn(),
  getFeedbackById: jest.fn(),
  updateFeedback: jest.fn(),
  getAllFeedbacks: jest.fn(),
  getHighPriorityFeedbacks: jest.fn(),
  getPendingCount: jest.fn(),
};

describe('FeedbackController', () => {
  let controller: FeedbackController;

  beforeEach(() => {
    controller = new FeedbackController(
      mockFeedbackService as unknown as FeedbackService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to the service with the current user id', async () => {
    const req: RequestWithUser = {
      user: { id: 'user-1', role: 'CUSTOMER' },
    };
    const dto = {
      title: 'Brake issue',
      description: 'Brake is loose',
      category: 'DAMAGE',
      scooterId: 'scooter-1',
    };
    mockFeedbackService.createFeedback.mockResolvedValue({
      id: 'fb-1',
    } as Awaited<ReturnType<FeedbackService['createFeedback']>>);

    await controller.create(req, dto);

    expect(mockFeedbackService.createFeedback).toHaveBeenCalledWith(
      'user-1',
      dto,
    );
  });

  it('returns the current user feedback list', async () => {
    const req: RequestWithUser = {
      user: { id: 'user-1', role: 'CUSTOMER' },
    };
    mockFeedbackService.getMyFeedbacks.mockResolvedValue([]);

    await controller.getMyFeedbacks(req);

    expect(mockFeedbackService.getMyFeedbacks).toHaveBeenCalledWith(
      'user-1',
      NaN,
      NaN,
    );
  });

  it('passes id, user id, and role when fetching feedback by id', async () => {
    const req: RequestWithUser = {
      user: { id: 'user-1', role: 'CUSTOMER' },
    };
    mockFeedbackService.getFeedbackById.mockResolvedValue({
      id: 'fb-1',
    } as Awaited<ReturnType<FeedbackService['getFeedbackById']>>);

    await controller.getFeedbackById(req, 'fb-1');

    expect(mockFeedbackService.getFeedbackById).toHaveBeenCalledWith(
      'fb-1',
      'user-1',
      'CUSTOMER',
    );
  });

  it('passes update input through to the service', async () => {
    const req: RequestWithUser = {
      user: { id: 'manager-1', role: 'MANAGER' },
    };
    const dto = {
      status: 'RESOLVED',
      managerNotes: 'Handled',
    };
    mockFeedbackService.updateFeedback.mockResolvedValue({
      id: 'fb-1',
    } as Awaited<ReturnType<FeedbackService['updateFeedback']>>);

    await controller.updateFeedback(req, 'fb-1', dto);

    expect(mockFeedbackService.updateFeedback).toHaveBeenCalledWith(
      'fb-1',
      dto,
      'manager-1',
      'MANAGER',
    );
  });

  it('builds filters before requesting all feedback', async () => {
    const req: RequestWithUser = {
      user: { id: 'manager-1', role: 'MANAGER' },
    };
    mockFeedbackService.getAllFeedbacks.mockResolvedValue([]);

    await controller.getAllFeedbacks(
      req,
      'PENDING' as Parameters<FeedbackController['getAllFeedbacks']>[1],
      'HIGH' as Parameters<FeedbackController['getAllFeedbacks']>[2],
      'DAMAGE' as Parameters<FeedbackController['getAllFeedbacks']>[3],
    );

    expect(mockFeedbackService.getAllFeedbacks).toHaveBeenCalledWith(
      'MANAGER',
      {
        status: 'PENDING',
        priority: 'HIGH',
        category: 'DAMAGE',
      },
      NaN,
      NaN,
    );
  });

  it('asks the service for high priority feedback', async () => {
    const req: RequestWithUser = {
      user: { id: 'manager-1', role: 'MANAGER' },
    };
    mockFeedbackService.getHighPriorityFeedbacks.mockResolvedValue([]);

    await controller.getHighPriorityFeedbacks(req);

    expect(mockFeedbackService.getHighPriorityFeedbacks).toHaveBeenCalledWith(
      'MANAGER',
      NaN,
      NaN,
    );
  });

  it('wraps pending count in an object response', async () => {
    const req: RequestWithUser = {
      user: { id: 'manager-1', role: 'MANAGER' },
    };
    mockFeedbackService.getPendingCount.mockResolvedValue(3);

    const result = await controller.getPendingCount(req);

    expect(mockFeedbackService.getPendingCount).toHaveBeenCalledWith('MANAGER');
    expect(result).toEqual({ count: 3 });
  });
});
