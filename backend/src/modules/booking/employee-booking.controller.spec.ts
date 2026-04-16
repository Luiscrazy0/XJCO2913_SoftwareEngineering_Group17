import { EmployeeBookingController } from './employee-booking.controller';
import { EmployeeBookingService } from './employee-booking.service';

type RequestWithUser = {
  user: {
    id: string;
  };
};

type EmployeeBookingServiceMock = Pick<
  EmployeeBookingService,
  'createBookingForGuest' | 'getEmployeeBookings'
>;

const mockEmployeeBookingService: jest.Mocked<EmployeeBookingServiceMock> = {
  createBookingForGuest: jest.fn(),
  getEmployeeBookings: jest.fn(),
};

describe('EmployeeBookingController', () => {
  let controller: EmployeeBookingController;

  beforeEach(() => {
    controller = new EmployeeBookingController(
      mockEmployeeBookingService as unknown as EmployeeBookingService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('converts guest booking payload dates before delegating', async () => {
    const req: RequestWithUser = { user: { id: 'employee-1' } };
    const bookingData = {
      guestEmail: 'guest@example.com',
      guestName: 'Guest User',
      scooterId: 'scooter-1',
      hireType: 'DAY_1',
      startTime: '2026-04-16T09:00:00.000Z',
      endTime: '2026-04-17T09:00:00.000Z',
    };

    await controller.createBookingForGuest(req, bookingData);

    expect(
      mockEmployeeBookingService.createBookingForGuest,
    ).toHaveBeenCalledWith(
      'employee-1',
      bookingData.guestEmail,
      bookingData.guestName,
      bookingData.scooterId,
      bookingData.hireType,
      new Date(bookingData.startTime),
      new Date(bookingData.endTime),
    );
  });

  it('loads the current employee bookings', async () => {
    const req: RequestWithUser = { user: { id: 'employee-1' } };

    await controller.getMyEmployeeBookings(req);

    expect(mockEmployeeBookingService.getEmployeeBookings).toHaveBeenCalledWith(
      'employee-1',
    );
  });
});
