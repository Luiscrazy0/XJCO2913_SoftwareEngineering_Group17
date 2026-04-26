import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentCardService } from './payment-card.service';

describe('Payment PaymentCardService', () => {
  let service: PaymentCardService;

  const mockPrismaService = {
    paymentCard: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
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

  it('stores the last four digits when adding a card', async () => {
    const card = { id: 'card-1', lastFourDigits: '1111' };
    mockPrismaService.paymentCard.create.mockResolvedValue(card);

    await expect(
      service.addCard('user-1', '4111111111111111', '12/30', 'Test User'),
    ).resolves.toEqual(card);

    expect(mockPrismaService.paymentCard.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        lastFourDigits: '1111',
        expiryDate: '12/30',
        cardHolder: 'Test User',
        isDefault: false,
      },
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

  it('updates the default card in a transaction', async () => {
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

  it('throws when deleting a card that does not exist', async () => {
    mockPrismaService.paymentCard.findUnique.mockResolvedValue(null);

    await expect(service.deleteCard('user-1', 'card-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('promotes another card when deleting the current default card', async () => {
    const deletedCard = { id: 'card-1' };
    mockPrismaService.paymentCard.findUnique.mockResolvedValue({
      id: 'card-1',
      isDefault: true,
    });
    mockPrismaService.paymentCard.findMany.mockResolvedValue([
      { id: 'card-2' },
    ]);
    mockPrismaService.paymentCard.delete.mockResolvedValue(deletedCard);

    await expect(service.deleteCard('user-1', 'card-1')).resolves.toEqual(
      deletedCard,
    );

    expect(mockPrismaService.paymentCard.update).toHaveBeenCalledWith({
      where: { id: 'card-2' },
      data: { isDefault: true },
    });
    expect(mockPrismaService.paymentCard.delete).toHaveBeenCalledWith({
      where: { id: 'card-1', userId: 'user-1' },
    });
  });

  it('deletes a default card without promoting another one when no backups exist', async () => {
    const deletedCard = { id: 'card-1' };
    mockPrismaService.paymentCard.findUnique.mockResolvedValue({
      id: 'card-1',
      isDefault: true,
    });
    mockPrismaService.paymentCard.findMany.mockResolvedValue([]);
    mockPrismaService.paymentCard.delete.mockResolvedValue(deletedCard);

    await expect(service.deleteCard('user-1', 'card-1')).resolves.toEqual(
      deletedCard,
    );

    expect(mockPrismaService.paymentCard.update).not.toHaveBeenCalled();
  });

  it('deletes non-default cards directly', async () => {
    const deletedCard = { id: 'card-1' };
    mockPrismaService.paymentCard.findUnique.mockResolvedValue({
      id: 'card-1',
      isDefault: false,
    });
    mockPrismaService.paymentCard.delete.mockResolvedValue(deletedCard);

    await expect(service.deleteCard('user-1', 'card-1')).resolves.toEqual(
      deletedCard,
    );

    expect(mockPrismaService.paymentCard.findMany).not.toHaveBeenCalled();
  });

  it('loads the default card for a user', async () => {
    const card = { id: 'card-1', isDefault: true };
    mockPrismaService.paymentCard.findFirst.mockResolvedValue(card);

    await expect(service.getDefaultCard('user-1')).resolves.toEqual(card);
    expect(mockPrismaService.paymentCard.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', isDefault: true },
    });
  });
});
