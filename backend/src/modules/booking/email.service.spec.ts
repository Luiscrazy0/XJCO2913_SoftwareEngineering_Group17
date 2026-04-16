import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

const mockedNodemailer = nodemailer as unknown as {
  createTransport: jest.Mock;
};

const createBooking = () => ({
  id: 'booking-1',
  hireType: 'HOUR_1',
  startTime: new Date('2026-04-16T08:00:00.000Z'),
  endTime: new Date('2026-04-16T09:00:00.000Z'),
  scooterId: 'scooter-1',
  user: {
    email: 'user@example.com',
  },
  scooter: {
    location: 'Main Street',
  },
});

describe('Booking EmailService', () => {
  let service: EmailService;
  let sendMail: jest.Mock;

  beforeEach(() => {
    sendMail = jest.fn().mockResolvedValue({ messageId: 'message-1' });
    mockedNodemailer.createTransport.mockReturnValue({ sendMail });
    service = new EmailService();
    jest.clearAllMocks();
    mockedNodemailer.createTransport.mockReturnValue({ sendMail });
  });

  it('sends booking confirmation emails', async () => {
    const booking = createBooking();

    await service.sendBookingConfirmation(booking as never, 18);

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.any(String),
        html: expect.stringContaining('booking-1'),
      }),
    );
    expect(sendMail.mock.calls[0][0].html).toContain('Main Street');
  });

  it('sends payment receipt emails', async () => {
    const booking = createBooking();

    await service.sendPaymentReceipt(booking as never, 18);

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.any(String),
        html: expect.stringContaining('booking-1'),
      }),
    );
  });

  it('sends extension confirmation emails', async () => {
    const booking = createBooking();
    const newEndTime = new Date('2026-04-16T10:00:00.000Z');

    await service.sendExtensionConfirmation(booking as never, 10, newEndTime);

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.any(String),
        html: expect.stringContaining('booking-1'),
      }),
    );
  });

  it('renders the intact return confirmation path', async () => {
    const booking = createBooking();

    await service.sendReturnConfirmation(booking as never, true);

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.any(String),
        html: expect.stringContaining('scooter-1'),
      }),
    );
  });

  it('swallows email transport failures after rendering the damaged return path', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const booking = createBooking();
    sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));

    await expect(
      service.sendReturnConfirmation(booking as never, false),
    ).resolves.toBeUndefined();

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('scooter-1'),
      }),
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
