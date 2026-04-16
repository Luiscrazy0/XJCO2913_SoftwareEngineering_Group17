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

  it('delegates create to PaymentService.createPayment', () => {
    const body = {
      bookingId: 'booking-1',
      amount: 19.99,
    };

    controller.create(body);

    expect(mockPaymentService.createPayment).toHaveBeenCalledWith(
      'booking-1',
      19.99,
    );
  });

  it('delegates getByBooking to PaymentService.getPaymentByBooking', () => {
    controller.getByBooking('booking-1');

    expect(mockPaymentService.getPaymentByBooking).toHaveBeenCalledWith(
      'booking-1',
    );
  });
});
