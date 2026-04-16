import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { FeedbackService } from './feedback.service';

type FeedbackCategoryValue = 'FAULT' | 'DAMAGE' | 'SUGGESTION';
type FeedbackPriorityValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type FeedbackStatusValue = 'PENDING' | 'RESOLVED' | 'ESCALATED' | 'CHARGEABLE';
type DamageTypeValue = 'NATURAL' | 'INTENTIONAL';
type RoleValue = 'CUSTOMER' | 'MANAGER';

type FeedbackRecord = {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategoryValue;
  priority: FeedbackPriorityValue;
  status: FeedbackStatusValue;
  scooterId: string;
  bookingId: string | null;
  imageUrl: string | null;
  managerNotes: string | null;
  resolutionCost: number | null;
  damageType: DamageTypeValue | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { email: string };
  scooter: { location: string };
  booking: { startTime: Date } | null;
};

type CreateFeedbackInput = Parameters<FeedbackService['createFeedback']>[1];
type UpdateFeedbackInput = Parameters<FeedbackService['updateFeedback']>[1];

const CUSTOMER_ROLE: RoleValue = 'CUSTOMER';
const MANAGER_ROLE: RoleValue = 'MANAGER';
const CATEGORY_DAMAGE: FeedbackCategoryValue = 'DAMAGE';
const CATEGORY_SUGGESTION: FeedbackCategoryValue = 'SUGGESTION';
const CATEGORY_FAULT: FeedbackCategoryValue = 'FAULT';
const PRIORITY_LOW: FeedbackPriorityValue = 'LOW';
const PRIORITY_HIGH: FeedbackPriorityValue = 'HIGH';
const PRIORITY_URGENT: FeedbackPriorityValue = 'URGENT';
const STATUS_PENDING: FeedbackStatusValue = 'PENDING';
const STATUS_RESOLVED: FeedbackStatusValue = 'RESOLVED';
const STATUS_CHARGEABLE: FeedbackStatusValue = 'CHARGEABLE';
const DAMAGE_NATURAL: DamageTypeValue = 'NATURAL';
const DAMAGE_INTENTIONAL: DamageTypeValue = 'INTENTIONAL';

type FeedbackCreateArgs = Parameters<PrismaService['feedback']['create']>[0];
type FeedbackFindManyArgs = Parameters<
  PrismaService['feedback']['findMany']
>[0];
type FeedbackFindUniqueArgs = Parameters<
  PrismaService['feedback']['findUnique']
>[0];
type FeedbackUpdateArgs = Parameters<PrismaService['feedback']['update']>[0];
type FeedbackCountArgs = Parameters<PrismaService['feedback']['count']>[0];

const createMock =
  jest.fn<(args: FeedbackCreateArgs) => Promise<FeedbackRecord>>();
const findManyMock =
  jest.fn<(args?: FeedbackFindManyArgs) => Promise<FeedbackRecord[]>>();
const findUniqueMock =
  jest.fn<(args: FeedbackFindUniqueArgs) => Promise<FeedbackRecord | null>>();
const updateMock =
  jest.fn<(args: FeedbackUpdateArgs) => Promise<FeedbackRecord>>();
const countMock = jest.fn<(args?: FeedbackCountArgs) => Promise<number>>();

const mockPrismaService = {
  feedback: {
    create: createMock,
    findMany: findManyMock,
    findUnique: findUniqueMock,
    update: updateMock,
    count: countMock,
  },
} as unknown as PrismaService;

const createFeedbackRecord = (
  overrides: Partial<FeedbackRecord> = {},
): FeedbackRecord => ({
  id: 'fb-123',
  title: 'Test Feedback',
  description: 'Test Description',
  category: CATEGORY_FAULT,
  priority: PRIORITY_LOW,
  status: STATUS_PENDING,
  scooterId: 'scooter-1',
  bookingId: null,
  imageUrl: null,
  managerNotes: null,
  resolutionCost: null,
  damageType: null,
  createdById: 'user-1',
  createdAt: new Date('2026-04-16T00:00:00.000Z'),
  updatedAt: new Date('2026-04-16T00:00:00.000Z'),
  createdBy: { email: 'test@test.com' },
  scooter: { location: 'Test Location' },
  booking: null,
  ...overrides,
});

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(() => {
    service = new FeedbackService(mockPrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFeedback', () => {
    const userId = 'user-1';

    it('sets damage feedback priority to HIGH', async () => {
      const createDto = {
        title: 'Brake broken',
        description: 'No brakes',
        category: CATEGORY_DAMAGE,
        scooterId: 'scooter-1',
      } as CreateFeedbackInput;

      createMock.mockResolvedValue(
        createFeedbackRecord({
          ...createDto,
          priority: PRIORITY_HIGH,
        }),
      );

      await service.createFeedback(userId, createDto);

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: PRIORITY_HIGH,
            status: STATUS_PENDING,
          }),
        }),
      );
    });

    it('keeps non-damage feedback at LOW priority', async () => {
      const createDto = {
        title: 'Add a basket',
        description: 'Would be useful for groceries',
        category: CATEGORY_SUGGESTION,
        scooterId: 'scooter-1',
      } as CreateFeedbackInput;

      createMock.mockResolvedValue(
        createFeedbackRecord({
          ...createDto,
          priority: PRIORITY_LOW,
        }),
      );

      await service.createFeedback(userId, createDto);

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: PRIORITY_LOW,
          }),
        }),
      );
    });

    it('includes booking data when bookingId is present', async () => {
      const bookingStartTime = new Date('2026-04-15T09:00:00.000Z');
      const createDto = {
        title: 'Broken bell',
        description: 'Bell does not ring',
        category: CATEGORY_DAMAGE,
        scooterId: 'scooter-1',
        bookingId: 'booking-1',
      } as CreateFeedbackInput;

      createMock.mockResolvedValue(
        createFeedbackRecord({
          ...createDto,
          priority: PRIORITY_HIGH,
          booking: { startTime: bookingStartTime },
        }),
      );

      const result = await service.createFeedback(userId, createDto);

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            booking: {
              select: { startTime: true },
            },
          }),
        }),
      );
      expect(result.bookingStartTime).toEqual(bookingStartTime);
    });
  });

  describe('getMyFeedbacks', () => {
    it('returns feedbacks created by the current user', async () => {
      findManyMock.mockResolvedValue([createFeedbackRecord()]);

      const result = await service.getMyFeedbacks('user-1');

      expect(findManyMock).toHaveBeenCalledWith({
        where: { createdById: 'user-1' },
        include: {
          createdBy: {
            select: { email: true },
          },
          scooter: {
            select: { location: true },
          },
          booking: {
            select: { startTime: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.createdByEmail).toBe('test@test.com');
    });
  });

  describe('getFeedbackById', () => {
    it('throws when the feedback does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(
        service.getFeedbackById('wrong-id', 'user-1', CUSTOMER_ROLE),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when a non-owner customer tries to view the feedback', async () => {
      findUniqueMock.mockResolvedValue(
        createFeedbackRecord({ createdById: 'another-user' }),
      );

      await expect(
        service.getFeedbackById('fb-123', 'hacker', CUSTOMER_ROLE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns the feedback for its creator', async () => {
      findUniqueMock.mockResolvedValue(
        createFeedbackRecord({ createdById: 'user-1' }),
      );

      const result = await service.getFeedbackById(
        'fb-123',
        'user-1',
        CUSTOMER_ROLE,
      );

      expect(result.id).toBe('fb-123');
    });

    it('returns the feedback for managers', async () => {
      findUniqueMock.mockResolvedValue(
        createFeedbackRecord({ createdById: 'another-user' }),
      );

      const result = await service.getFeedbackById(
        'fb-123',
        'admin',
        MANAGER_ROLE,
      );

      expect(result.id).toBe('fb-123');
    });
  });

  describe('updateFeedback', () => {
    const feedbackId = 'fb-123';

    it('throws when the feedback does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(
        service.updateFeedback(
          feedbackId,
          {} as UpdateFeedbackInput,
          'admin',
          MANAGER_ROLE,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when a non-manager tries to update feedback', async () => {
      findUniqueMock.mockResolvedValue(createFeedbackRecord());

      await expect(
        service.updateFeedback(
          feedbackId,
          {} as UpdateFeedbackInput,
          'user',
          CUSTOMER_ROLE,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('sets resolutionCost to 0 for natural damage', async () => {
      findUniqueMock.mockResolvedValue(createFeedbackRecord());
      updateMock.mockResolvedValue(
        createFeedbackRecord({
          damageType: DAMAGE_NATURAL,
          resolutionCost: 0,
        }),
      );

      await service.updateFeedback(
        feedbackId,
        {
          damageType: DAMAGE_NATURAL,
        } as UpdateFeedbackInput,
        'admin',
        MANAGER_ROLE,
      );

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            damageType: DAMAGE_NATURAL,
            resolutionCost: 0,
          }),
        }),
      );
    });

    it('forces status to CHARGEABLE for intentional damage', async () => {
      findUniqueMock.mockResolvedValue(
        createFeedbackRecord({ status: STATUS_PENDING }),
      );
      updateMock.mockResolvedValue(
        createFeedbackRecord({
          damageType: DAMAGE_INTENTIONAL,
          status: STATUS_CHARGEABLE,
        }),
      );

      await service.updateFeedback(
        feedbackId,
        {
          damageType: DAMAGE_INTENTIONAL,
          status: STATUS_RESOLVED,
        } as UpdateFeedbackInput,
        'admin',
        MANAGER_ROLE,
      );

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            damageType: DAMAGE_INTENTIONAL,
            status: STATUS_CHARGEABLE,
          }),
        }),
      );
    });
  });

  describe('getAllFeedbacks', () => {
    it('throws when a non-manager requests all feedback', async () => {
      await expect(service.getAllFeedbacks(CUSTOMER_ROLE)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('passes status, priority, and category filters to Prisma', async () => {
      findManyMock.mockResolvedValue([createFeedbackRecord()]);

      await service.getAllFeedbacks(MANAGER_ROLE, {
        status: STATUS_PENDING,
        priority: PRIORITY_HIGH,
        category: CATEGORY_DAMAGE,
      });

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: STATUS_PENDING,
            priority: PRIORITY_HIGH,
            category: CATEGORY_DAMAGE,
          },
        }),
      );
    });
  });

  describe('getHighPriorityFeedbacks', () => {
    it('throws when a non-manager requests high priority feedback', async () => {
      await expect(
        service.getHighPriorityFeedbacks(CUSTOMER_ROLE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('queries HIGH and URGENT feedback that are not resolved', async () => {
      findManyMock.mockResolvedValue([
        createFeedbackRecord({ priority: PRIORITY_HIGH }),
      ]);

      await service.getHighPriorityFeedbacks(MANAGER_ROLE);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ priority: PRIORITY_HIGH }, { priority: PRIORITY_URGENT }],
            status: { not: STATUS_RESOLVED },
          },
        }),
      );
    });
  });

  describe('getPendingCount', () => {
    it('returns 0 for non-managers without calling Prisma', async () => {
      const result = await service.getPendingCount(CUSTOMER_ROLE);

      expect(result).toBe(0);
      expect(countMock).not.toHaveBeenCalled();
    });

    it('returns the Prisma count for managers', async () => {
      countMock.mockResolvedValue(5);

      const result = await service.getPendingCount(MANAGER_ROLE);

      expect(result).toBe(5);
      expect(countMock).toHaveBeenCalledWith({
        where: { status: STATUS_PENDING },
      });
    });
  });
});
