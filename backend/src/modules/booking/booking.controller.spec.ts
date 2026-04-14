import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PaymentCardService } from './payment-card.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ExtendBookingDto } from './dto/extend-booking.dto';
import { HireType, BookingStatus } from '@prisma/client';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

describe('BookingController', () => {
  let controller: BookingController;

  const mockBookingService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    createBooking: jest.fn(),
    extendBooking: jest.fn(),
    cancelBooking: jest.fn(),
    createBookingForCustomer: jest.fn(),
  };

  const mockPaymentCardService = {
    savePaymentCard: jest.fn(),
    getPaymentCard: jest.fn(),
    deletePaymentCard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
        {
          provide: PaymentCardService,
          useValue: mockPaymentCardService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookingController>(BookingController);
    jest.clearAllMocks();
  });

  it('应该被定义', () => {
    expect(controller).toBeDefined();
  });

  describe('DTO验证测试', () => {
    describe('CreateBookingDto', () => {
      it('应该接受有效的UUID格式的scooterId和userId', async () => {
        const dto = new CreateBookingDto();
        dto.userId = '0199f4f6-8f16-490c-a176-605411b019d4';
        dto.scooterId = '3c08fcf4-5607-480c-b8a7-85cc674f51a7';
        dto.hireType = HireType.HOUR_1;
        dto.startTime = '2026-04-12T10:00:00.000Z';
        dto.endTime = '2026-04-12T11:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('应该拒绝非UUID格式的scooterId', async () => {
        const dto = new CreateBookingDto();
        dto.userId = '0199f4f6-8f16-490c-a176-605411b019d4';
        dto.scooterId = 'SC001'; // 非UUID格式
        dto.hireType = HireType.HOUR_1;
        dto.startTime = '2026-04-12T10:00:00.000Z';
        dto.endTime = '2026-04-12T11:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('scooterId');
        expect(errors[0].constraints).toHaveProperty('isUuid');
      });

      it('应该拒绝非UUID格式的userId', async () => {
        const dto = new CreateBookingDto();
        dto.userId = 'user-123'; // 非UUID格式
        dto.scooterId = '3c08fcf4-5607-480c-b8a7-85cc674f51a7';
        dto.hireType = HireType.HOUR_1;
        dto.startTime = '2026-04-12T10:00:00.000Z';
        dto.endTime = '2026-04-12T11:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('userId');
        expect(errors[0].constraints).toHaveProperty('isUuid');
      });

      it('应该拒绝无效的hireType', async () => {
        const dto = new CreateBookingDto();
        dto.userId = '0199f4f6-8f16-490c-a176-605411b019d4';
        dto.scooterId = '3c08fcf4-5607-480c-b8a7-85cc674f51a7';
        dto.hireType = 'INVALID_TYPE' as HireType; // 无效的租赁类型
        dto.startTime = '2026-04-12T10:00:00.000Z';
        dto.endTime = '2026-04-12T11:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('hireType');
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });

      it('应该拒绝无效的日期格式', async () => {
        const dto = new CreateBookingDto();
        dto.userId = '0199f4f6-8f16-490c-a176-605411b019d4';
        dto.scooterId = '3c08fcf4-5607-480c-b8a7-85cc674f51a7';
        dto.hireType = HireType.HOUR_1;
        dto.startTime = 'invalid-date'; // 无效的日期格式
        dto.endTime = '2026-04-12T11:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('startTime');
        expect(errors[0].constraints).toHaveProperty('isDateString');
      });

      it('应该接受所有有效的HireType枚举值', async () => {
        const validHireTypes = [
          HireType.HOUR_1,
          HireType.HOUR_4,
          HireType.DAY_1,
          HireType.WEEK_1,
        ];

        for (const hireType of validHireTypes) {
          const dto = new CreateBookingDto();
          dto.userId = '0199f4f6-8f16-490c-a176-605411b019d4';
          dto.scooterId = '3c08fcf4-5607-480c-b8a7-85cc674f51a7';
          dto.hireType = hireType;
          dto.startTime = '2026-04-12T10:00:00.000Z';
          dto.endTime = '2026-04-12T11:00:00.000Z';

          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        }
      });
    });

    describe('ExtendBookingDto', () => {
      it('应该接受有效的additionalHours', async () => {
        const dto = new ExtendBookingDto();
        dto.additionalHours = 2;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('应该拒绝非数字的additionalHours', async () => {
        const dto = new ExtendBookingDto();
        (dto as any).additionalHours = 'not-a-number';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('应该拒绝负数additionalHours', async () => {
        const dto = new ExtendBookingDto();
        dto.additionalHours = -1;

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });

      it('应该拒绝零additionalHours', async () => {
        const dto = new ExtendBookingDto();
        dto.additionalHours = 0;

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('控制器方法', () => {
    it('create方法应该调用bookingService.createBooking', async () => {
      const createBookingDto: CreateBookingDto = {
        userId: '0199f4f6-8f16-490c-a176-605411b019d4',
        scooterId: '3c08fcf4-5607-480c-b8a7-85cc674f51a7',
        hireType: HireType.HOUR_1,
        startTime: '2026-04-12T10:00:00.000Z',
        endTime: '2026-04-12T11:00:00.000Z',
      };

      const mockBooking = {
        id: 'booking-id',
        userId: createBookingDto.userId,
        scooterId: createBookingDto.scooterId,
        hireType: createBookingDto.hireType,
        startTime: new Date(createBookingDto.startTime),
        endTime: new Date(createBookingDto.endTime),
        status: BookingStatus.PENDING_PAYMENT,
        totalCost: 5,
      };

      mockBookingService.createBooking.mockResolvedValue(mockBooking);

      const result = await controller.create(createBookingDto);

      expect(mockBookingService.createBooking).toHaveBeenCalledWith(
        createBookingDto.userId,
        createBookingDto.scooterId,
        createBookingDto.hireType,
        new Date(createBookingDto.startTime),
        new Date(createBookingDto.endTime),
      );
      expect(result).toBe(mockBooking);
    });

    it('extend方法应该调用bookingService.extendBooking', async () => {
      const bookingId = 'booking-id';
      const extendBookingDto: ExtendBookingDto = { additionalHours: 2 };
      const mockExtendedBooking = {
        id: bookingId,
        status: BookingStatus.EXTENDED,
        totalCost: 15,
      };

      mockBookingService.extendBooking.mockResolvedValue(mockExtendedBooking);

      const result = await controller.extend(bookingId, extendBookingDto);

      expect(mockBookingService.extendBooking).toHaveBeenCalledWith(
        bookingId,
        extendBookingDto.additionalHours,
      );
      expect(result).toBe(mockExtendedBooking);
    });

    it('cancel方法应该调用bookingService.cancelBooking', async () => {
      const bookingId = 'booking-id';
      const mockCancelledBooking = {
        id: bookingId,
        status: BookingStatus.CANCELLED,
      };

      mockBookingService.cancelBooking.mockResolvedValue(mockCancelledBooking);

      const result = await controller.cancel(bookingId);

      expect(mockBookingService.cancelBooking).toHaveBeenCalledWith(bookingId);
      expect(result).toBe(mockCancelledBooking);
    });
  });

  describe('错误处理', () => {
    it('当bookingService.createBooking抛出BadRequestException时应该传播异常', async () => {
      const createBookingDto: CreateBookingDto = {
        userId: '0199f4f6-8f16-490c-a176-605411b019d4',
        scooterId: '3c08fcf4-5607-480c-b8a7-85cc674f51a7',
        hireType: HireType.HOUR_1,
        startTime: '2026-04-12T10:00:00.000Z',
        endTime: '2026-04-12T11:00:00.000Z',
      };

      const errorMessage = 'Scooter not available';
      mockBookingService.createBooking.mockRejectedValue(
        new BadRequestException(errorMessage),
      );

      await expect(controller.create(createBookingDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create(createBookingDto)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});