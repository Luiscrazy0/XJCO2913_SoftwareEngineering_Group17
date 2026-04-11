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

    // 这里可以集成实际的邮件服务，如Nodemailer
    // 为了快速实现，我们只记录日志
    console.log(`[邮件服务] 预订确认邮件已发送到 ${email}`);
    console.log(`[邮件服务] 预订详情: ID=${bookingId}, 金额=¥${amount}`);
  }

  async sendPaymentReceipt(
    email: string,
    paymentId: string,
    amount: number,
  ): Promise<void> {
    this.logger.log(`发送支付收据邮件到: ${email}`);
    this.logger.log(`支付ID: ${paymentId}, 金额: ¥${amount}`);

    console.log(`[邮件服务] 支付收据邮件已发送到 ${email}`);
    console.log(`[邮件服务] 支付详情: ID=${paymentId}, 金额=¥${amount}`);
  }
}
