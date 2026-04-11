import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentCardService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
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

    // 保存到数据库
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        cardNumber: encryptedCardNumber,
        cardExpiry: cardData.cardExpiry,
        cardHolder: cardData.cardHolder,
      },
      select: {
        id: true,
        email: true,
        cardHolder: true,
        cardExpiry: true,
        // 不返回加密的卡号
      },
    });

    return updatedUser;
  }

  /**
   * 获取用户的银行卡信息（用于显示）
   */
  async getPaymentCard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        cardNumber: true,
        cardExpiry: true,
        cardHolder: true,
      },
    });

    if (!user || !user.cardNumber) {
      return null;
    }

    // 解密卡号并返回最后4位
    const decryptedCardNumber = this.decrypt(user.cardNumber);
    const lastFourDigits = decryptedCardNumber.slice(-4);
    const maskedCardNumber = `**** **** **** ${lastFourDigits}`;

    return {
      cardNumber: maskedCardNumber,
      cardExpiry: user.cardExpiry,
      cardHolder: user.cardHolder,
    };
  }

  /**
   * 获取完整的银行卡信息（用于支付，不应暴露给前端）
   */
  async getFullPaymentCard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        cardNumber: true,
        cardExpiry: true,
        cardHolder: true,
      },
    });

    if (!user || !user.cardNumber) {
      return null;
    }

    // 解密卡号
    const decryptedCardNumber = this.decrypt(user.cardNumber);

    return {
      cardNumber: decryptedCardNumber,
      cardExpiry: user.cardExpiry,
      cardHolder: user.cardHolder,
    };
  }

  /**
   * 删除用户的银行卡信息
   */
  async deletePaymentCard(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        cardNumber: null,
        cardExpiry: null,
        cardHolder: null,
      },
    });

    return { message: '银行卡信息已删除' };
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
