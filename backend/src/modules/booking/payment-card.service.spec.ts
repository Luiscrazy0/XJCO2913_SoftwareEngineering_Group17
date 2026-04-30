import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentCardService } from './payment-card.service';

const futureExpiry = '12/99';

describe('Booking PaymentCardService', () => {
  let service: PaymentCardService;

  const mockPrismaService = {
    paymentCard: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    service = new PaymentCardService(
      mockPrismaService as unknown as PrismaService,
    );
    jest.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      (callback: (tx: typeof mockPrismaService) => Promise<unknown>) =>
        callback(mockPrismaService),
    );
  });

  it('rejects card numbers that are too short', async () => {
    await expect(
      service.savePaymentCard('user-1', {
        cardNumber: '1234',
        cardExpiry: futureExpiry,
        cardHolder: 'Test User',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects card numbers that fail the Luhn check', async () => {
    await expect(
      service.savePaymentCard('user-1', {
        cardNumber: '4111111111111112',
        cardExpiry: futureExpiry,
        cardHolder: 'Test User',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid expiry formats', async () => {
    await expect(
      service.savePaymentCard('user-1', {
        cardNumber: '4111111111111111',
        cardExpiry: '1230',
        cardHolder: 'Test User',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid expiry months', async () => {
    await expect(
      service.savePaymentCard('user-1', {
        cardNumber: '4111111111111111',
        cardExpiry: '13/30',
        cardHolder: 'Test User',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects expired cards', async () => {
    await expect(
      service.savePaymentCard('user-1', {
        cardNumber: '4111111111111111',
        cardExpiry: '01/20',
        cardHolder: 'Test User',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('saves a valid card and returns the selected fields', async () => {
    const paymentCard = {
      id: 'card-1',
      lastFourDigits: '1111',
      expiryDate: futureExpiry,
      cardHolder: 'Test User',
      isDefault: false,
      createdAt: new Date('2026-04-16T00:00:00.000Z'),
    };
    mockPrismaService.paymentCard.create.mockResolvedValue(paymentCard);

    await expect(
      service.savePaymentCard('user-1', {
        cardNumber: '4111111111111111',
        cardExpiry: futureExpiry,
        cardHolder: 'Test User',
      }),
    ).resolves.toEqual(paymentCard);

    expect(mockPrismaService.paymentCard.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        lastFourDigits: '1111',
        encryptedCardNumber: expect.any(String) as string,
        expiryDate: futureExpiry,
        cardHolder: 'Test User',
        isDefault: false,
      },
      select: {
        id: true,
        lastFourDigits: true,
        expiryDate: true,
        cardHolder: true,
        isDefault: true,
        createdAt: true,
      },
    });
  });

  it('returns null when there is no default card to display', async () => {
    mockPrismaService.paymentCard.findFirst.mockResolvedValue(null);

    await expect(service.getPaymentCard('user-1')).resolves.toBeNull();
  });

  it('returns a masked default card when one exists', async () => {
    mockPrismaService.paymentCard.findFirst.mockResolvedValue({
      lastFourDigits: '1111',
      expiryDate: futureExpiry,
      cardHolder: 'Test User',
    });

    await expect(service.getPaymentCard('user-1')).resolves.toEqual({
      cardNumber: '**** **** **** 1111',
      cardExpiry: futureExpiry,
      cardHolder: 'Test User',
    });
  });

  it('returns null when the full default card is unavailable', async () => {
    mockPrismaService.paymentCard.findFirst.mockResolvedValue(null);

    await expect(service.getFullPaymentCard('user-1')).resolves.toBeNull();
  });

  it('throws when asking for the full default card details', async () => {
    mockPrismaService.paymentCard.findFirst.mockResolvedValue({
      id: 'card-1',
      lastFourDigits: '1111',
    });

    await expect(service.getFullPaymentCard('user-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when trying to delete a missing specific card', async () => {
    mockPrismaService.paymentCard.findUnique.mockResolvedValue(null);

    await expect(service.deletePaymentCard('user-1', 'card-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deletes a specific card when it exists', async () => {
    mockPrismaService.paymentCard.findUnique.mockResolvedValue({
      id: 'card-1',
    });
    mockPrismaService.paymentCard.delete.mockResolvedValue({ id: 'card-1' });

    await expect(
      service.deletePaymentCard('user-1', 'card-1'),
    ).resolves.toEqual(
      expect.objectContaining({ message: expect.any(String) }),
    );

    expect(mockPrismaService.paymentCard.delete).toHaveBeenCalledWith({
      where: { id: 'card-1', userId: 'user-1' },
    });
  });

  it('deletes all cards when no card id is provided', async () => {
    await expect(service.deletePaymentCard('user-1')).resolves.toEqual(
      expect.objectContaining({ message: expect.any(String) }),
    );

    expect(mockPrismaService.paymentCard.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('loads all user cards ordered by default status', async () => {
    const cards = [{ id: 'card-1' }, { id: 'card-2' }];
    mockPrismaService.paymentCard.findMany.mockResolvedValue(cards);

    await expect(service.getUserCards('user-1')).resolves.toEqual(cards);
    expect(mockPrismaService.paymentCard.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { isDefault: 'desc' },
    });
  });

  it('updates the default card inside a transaction', async () => {
    const updatedCard = { id: 'card-2', isDefault: true };
    mockPrismaService.paymentCard.update.mockResolvedValue(updatedCard);

    await expect(service.setDefaultCard('user-1', 'card-2')).resolves.toEqual(
      updatedCard,
    );

    expect(mockPrismaService.paymentCard.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { isDefault: false },
    });
    expect(mockPrismaService.paymentCard.update).toHaveBeenCalledWith({
      where: { id: 'card-2', userId: 'user-1' },
      data: { isDefault: true },
    });
  });

  it('encrypts and decrypts card data consistently', () => {
    const encrypt = (
      Reflect.get(service, 'encrypt') as (text: string) => string
    ).bind(service);
    const decrypt = (
      Reflect.get(service, 'decrypt') as (encryptedText: string) => string
    ).bind(service);

    const encrypted = encrypt('4111111111111111');

    expect(encrypted).toContain(':');
    expect(decrypt(encrypted)).toBe('4111111111111111');
  });
});
