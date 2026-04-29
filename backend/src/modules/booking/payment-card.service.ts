import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentCardService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.scryptSync(
    (() => {
      const key = process.env.ENCRYPTION_KEY;
      if (!key) throw new Error('ENCRYPTION_KEY environment variable is required');
      return key;
    })(),
    'salt',
    32,
  );
  private readonly iv = crypto.randomBytes(16); // 在生产环境中应该为每个用户生成唯一的IV

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 保存用户的银行卡信息（加密存储）
   */
  async savePaymentCard(
    userId: string,
    cardData: {
      cardNumber: string;
      cardExpiry: string;
      cardHolder: string;
    },
  ) {
    // 验证卡号格式（简单验证）
    if (!this.isValidCardNumber(cardData.cardNumber)) {
      throw new BadRequestException('无效的银行卡号');
    }

    // 验证过期日期格式
    if (!this.isValidExpiryDate(cardData.cardExpiry)) {
      throw new BadRequestException('无效的过期日期格式，应为MM/YY');
    }

    // 加密卡号
    const encryptedCardNumber = this.encrypt(cardData.cardNumber);
    const lastFourDigits = cardData.cardNumber.slice(-4);

    // 保存到数据库 - 使用PaymentCard模型
    const paymentCard = await this.prisma.paymentCard.create({
      data: {
        userId,
        lastFourDigits,
        expiryDate: cardData.cardExpiry,
        cardHolder: cardData.cardHolder,
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

    return paymentCard;
  }

  /**
   * 获取用户的银行卡信息（用于显示）
   */
  async getPaymentCard(userId: string) {
    const paymentCard = await this.prisma.paymentCard.findFirst({
      where: { userId, isDefault: true },
      select: {
        lastFourDigits: true,
        expiryDate: true,
        cardHolder: true,
      },
    });

    if (!paymentCard) {
      return null;
    }

    const maskedCardNumber = `**** **** **** ${paymentCard.lastFourDigits}`;

    return {
      cardNumber: maskedCardNumber,
      cardExpiry: paymentCard.expiryDate,
      cardHolder: paymentCard.cardHolder,
    };
  }

  /**
   * 获取完整的银行卡信息（用于支付，不应暴露给前端）
   */
  async getFullPaymentCard(userId: string) {
    const paymentCard = await this.prisma.paymentCard.findFirst({
      where: { userId, isDefault: true },
    });

    if (!paymentCard) {
      return null;
    }

    // 注意：这里需要存储加密的卡号在数据库中才能解密
    // 由于我们只存储了最后4位，无法返回完整卡号
    // 在实际项目中，应该存储加密的完整卡号
    throw new BadRequestException('完整银行卡信息不可用，只存储了最后4位数字');
  }

  /**
   * 删除用户的银行卡信息
   */
  async deletePaymentCard(userId: string, cardId?: string) {
    if (cardId) {
      // 删除特定卡片
      const card = await this.prisma.paymentCard.findUnique({
        where: { id: cardId, userId },
      });

      if (!card) {
        throw new NotFoundException('银行卡不存在');
      }

      await this.prisma.paymentCard.delete({
        where: { id: cardId, userId },
      });
    } else {
      // 删除用户的所有卡片
      await this.prisma.paymentCard.deleteMany({
        where: { userId },
      });
    }

    return { message: '银行卡信息已删除' };
  }

  /**
   * 获取用户的所有银行卡
   */
  async getUserCards(userId: string) {
    return this.prisma.paymentCard.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  /**
   * 设置默认银行卡
   */
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

  /**
   * 加密数据
   */
  private encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${this.iv.toString('hex')}:${encrypted}`;
  }

  /**
   * 解密数据
   */
  private decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * 验证银行卡号格式（Luhn算法简单检查）
   */
  private isValidCardNumber(cardNumber: string): boolean {
    // 移除所有非数字字符
    const cleaned = cardNumber.replace(/\D/g, '');

    // 检查长度（13-19位）
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn算法校验
    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  /**
   * 验证过期日期格式 (MM/YY)
   */
  private isValidExpiryDate(expiry: string): boolean {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      return false;
    }

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000; // 转换为4位年份

    if (month < 1 || month > 12) {
      return false;
    }

    const now = new Date();
    const expiryDate = new Date(year, month - 1);

    return expiryDate > now;
  }
}
