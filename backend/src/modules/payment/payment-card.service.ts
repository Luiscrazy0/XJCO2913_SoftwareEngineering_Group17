import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentCardService {
  constructor(private readonly prisma: PrismaService) {}

  async addCard(
    userId: string,
    cardNumber: string,
    expiryDate: string,
    cardHolder: string,
  ) {
    // 在实际项目中，这里应该加密存储银行卡信息
    // 为了快速实现，我们只存储最后4位数字

    const lastFourDigits = cardNumber.slice(-4);

    return this.prisma.paymentCard.create({
      data: {
        userId,
        lastFourDigits,
        expiryDate,
        cardHolder,
        isDefault: false, // 默认不设为默认卡
      },
    });
  }

  async getUserCards(userId: string) {
    return this.prisma.paymentCard.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async setDefaultCard(userId: string, cardId: string) {
    // 开始事务：先取消所有卡的默认状态，然后设置指定卡为默认
    return this.prisma.$transaction(async (tx) => {
      // 取消所有卡的默认状态
      await tx.paymentCard.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      // 设置指定卡为默认
      return tx.paymentCard.update({
        where: { id: cardId, userId },
        data: { isDefault: true },
      });
    });
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await this.prisma.paymentCard.findUnique({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    // 如果是默认卡，需要处理
    if (card.isDefault) {
      // 查找是否有其他卡可以设为默认
      const otherCards = await this.prisma.paymentCard.findMany({
        where: { userId, id: { not: cardId } },
      });

      if (otherCards.length > 0) {
        // 将第一张其他卡设为默认
        await this.prisma.paymentCard.update({
          where: { id: otherCards[0].id },
          data: { isDefault: true },
        });
      }
    }

    return this.prisma.paymentCard.delete({
      where: { id: cardId, userId },
    });
  }

  async getDefaultCard(userId: string) {
    return this.prisma.paymentCard.findFirst({
      where: { userId, isDefault: true },
    });
  }
}
