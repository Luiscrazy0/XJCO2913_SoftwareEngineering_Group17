import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

type PaymentServiceMock = Pick<
  PaymentService,
  'createPayment' | 'getPaymentByBooking'
>;

const mockPaymentService: jest.Mocked<PaymentServiceMock> = {
  createPayment: jest.fn(),
  getPaymentByBooking: jest.fn(),
};

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(() => {
    controller = new PaymentController(
      mockPaymentService as unknown as PaymentService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to PaymentService.createPayment with user ID', () => {
    const body = {
      bookingId: 'booking-1',
      amount: 19.99,
    };
    const mockReq = {
      user: { sub: 'user-1', id: 'user-1', role: 'CUSTOMER' },
    };

    controller.create(body, mockReq);

    expect(mockPaymentService.createPayment).toHaveBeenCalledWith(
      'booking-1',
      19.99,
      'user-1',
      undefined,
    );
  });

  it('delegates getByBooking to PaymentService.getPaymentByBooking with user ID', () => {
    const mockReq = {
      user: { sub: 'user-1', id: 'user-1', role: 'CUSTOMER' },
    };

    controller.getByBooking('booking-1', mockReq);

    expect(mockPaymentService.getPaymentByBooking).toHaveBeenCalledWith(
      'booking-1',
      'user-1',
    );
  });
});
