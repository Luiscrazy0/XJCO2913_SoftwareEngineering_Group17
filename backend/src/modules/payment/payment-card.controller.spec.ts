import { PaymentCardController } from './payment-card.controller';
import { PaymentCardService } from './payment-card.service';

type RequestWithUser = {
  user: {
    id: string;
  };
};

type PaymentCardServiceMock = Pick<
  PaymentCardService,
  | 'addCard'
  | 'getUserCards'
  | 'getDefaultCard'
  | 'setDefaultCard'
  | 'deleteCard'
>;

const mockPaymentCardService: jest.Mocked<PaymentCardServiceMock> = {
  addCard: jest.fn(),
  getUserCards: jest.fn(),
  getDefaultCard: jest.fn(),
  setDefaultCard: jest.fn(),
  deleteCard: jest.fn(),
};

describe('PaymentCardController', () => {
  let controller: PaymentCardController;

  beforeEach(() => {
    controller = new PaymentCardController(
      mockPaymentCardService as unknown as PaymentCardService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes addCard arguments through with the authenticated user id', async () => {
    const req: RequestWithUser = { user: { id: 'user-1' } };
    const cardData = {
      cardNumber: '4111111111111111',
      expiryDate: '12/30',
      cardHolder: 'Test User',
    };

    await controller.addCard(req, cardData);

    expect(mockPaymentCardService.addCard).toHaveBeenCalledWith(
      'user-1',
      cardData.cardNumber,
      cardData.expiryDate,
      cardData.cardHolder,
    );
  });

  it('loads all cards for the current user', async () => {
    const req: RequestWithUser = { user: { id: 'user-1' } };

    await controller.getUserCards(req);

    expect(mockPaymentCardService.getUserCards).toHaveBeenCalledWith('user-1');
  });

  it('loads the default card for the current user', async () => {
    const req: RequestWithUser = { user: { id: 'user-1' } };

    await controller.getDefaultCard(req);

    expect(mockPaymentCardService.getDefaultCard).toHaveBeenCalledWith(
      'user-1',
    );
  });

  it('sets the default card for the current user', async () => {
    const req: RequestWithUser = { user: { id: 'user-1' } };

    await controller.setDefaultCard(req, 'card-1');

    expect(mockPaymentCardService.setDefaultCard).toHaveBeenCalledWith(
      'user-1',
      'card-1',
    );
  });

  it('deletes a card for the current user', async () => {
    const req: RequestWithUser = { user: { id: 'user-1' } };

    await controller.deleteCard(req, 'card-1');

    expect(mockPaymentCardService.deleteCard).toHaveBeenCalledWith(
      'user-1',
      'card-1',
    );
  });
});
