import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendBookingConfirmation(
    email: string,
    bookingId: string,
    amount: number,
  ): Promise<void> {
    // 模拟发送邮件 - 在实际项目中应该集成邮件服务
    this.logger.log(`发送预订确认邮件到: ${email}`);
    this.logger.log(`预订ID: ${bookingId}, 金额: ¥${amount}`);

    // Integration point: connect to actual email service like Nodemailer
  }

  async sendPaymentReceipt(
    email: string,
    paymentId: string,
    amount: number,
  ): Promise<void> {
    this.logger.log(`发送支付收据邮件到: ${email}`);
    this.logger.log(`支付ID: ${paymentId}, 金额: ¥${amount}`);

  }
}
