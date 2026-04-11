import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Booking, User } from '@prisma/client';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // 配置邮件传输器
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * 发送预订确认邮件
   */
  async sendBookingConfirmation(booking: Booking & { user: User; scooter: any }, paymentAmount: number) {
    const subject = '滑板车租赁预订确认';
    const html = this.generateBookingConfirmationHtml(booking, paymentAmount);

    await this.sendEmail(booking.user.email, subject, html);
  }

  /**
   * 发送支付收据邮件
   */
  async sendPaymentReceipt(booking: Booking & { user: User }, paymentAmount: number) {
    const subject = '滑板车租赁支付收据';
    const html = this.generatePaymentReceiptHtml(booking, paymentAmount);

    await this.sendEmail(booking.user.email, subject, html);
  }

  /**
   * 发送续租确认邮件
   */
  async sendExtensionConfirmation(booking: Booking & { user: User }, extensionCost: number, newEndTime: Date) {
    const subject = '滑板车租赁续租确认';
    const html = this.generateExtensionConfirmationHtml(booking, extensionCost, newEndTime);

    await this.sendEmail(booking.user.email, subject, html);
  }

  /**
   * 通用邮件发送方法
   */
  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const mailOptions = {
        from: `"滑板车租赁系统" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('邮件发送成功:', info.messageId);
    } catch (error) {
      console.error('邮件发送失败:', error);
      // 在生产环境中，这里应该记录到日志系统
      // 暂时不抛出错误，以免影响主要业务流程
    }
  }

  /**
   * 生成预订确认邮件HTML
   */
  private generateBookingConfirmationHtml(booking: Booking & { user: User; scooter: any }, paymentAmount: number): string {
    const hireTypeNames = {
      HOUR_1: '1小时租赁',
      HOUR_4: '4小时租赁',
      DAY_1: '1天租赁',
      WEEK_1: '1周租赁',
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>预订确认</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px 0; }
          .booking-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .highlight { color: #007bff; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>预订确认</h1>
            <p>您的滑板车租赁预订已成功确认</p>
          </div>

          <div class="content">
            <p>尊敬的${booking.user.email}，</p>

            <p>感谢您选择我们的滑板车租赁服务。您的预订已成功确认，详情如下：</p>

            <div class="booking-details">
              <h3>预订详情</h3>
              <p><strong>预订编号：</strong> ${booking.id}</p>
              <p><strong>租赁类型：</strong> ${hireTypeNames[booking.hireType]}</p>
              <p><strong>开始时间：</strong> ${booking.startTime.toLocaleString('zh-CN')}</p>
              <p><strong>结束时间：</strong> ${booking.endTime.toLocaleString('zh-CN')}</p>
              <p><strong>滑板车位置：</strong> ${booking.scooter.location}</p>
              <p><strong>支付金额：</strong> <span class="highlight">¥${paymentAmount.toFixed(2)}</span></p>
            </div>

            <p>请按时到指定地点取车。如有任何问题，请联系我们的客服。</p>

            <p>祝您使用愉快！</p>
          </div>

          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>© 2024 滑板车租赁系统</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 生成支付收据邮件HTML
   */
  private generatePaymentReceiptHtml(booking: Booking & { user: User }, paymentAmount: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>支付收据</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px 0; }
          .receipt-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .amount { color: #28a745; font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>支付收据</h1>
            <p>您的支付已成功处理</p>
          </div>

          <div class="content">
            <p>尊敬的${booking.user.email}，</p>

            <p>您的支付已成功处理。以下是您的支付详情：</p>

            <div class="receipt-details">
              <h3>支付详情</h3>
              <p><strong>预订编号：</strong> ${booking.id}</p>
              <p><strong>支付时间：</strong> ${new Date().toLocaleString('zh-CN')}</p>
              <p><strong>支付金额：</strong> <span class="amount">¥${paymentAmount.toFixed(2)}</span></p>
            </div>

            <p>感谢您的惠顾！</p>
          </div>

          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>© 2024 滑板车租赁系统</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 生成续租确认邮件HTML
   */
  private generateExtensionConfirmationHtml(booking: Booking & { user: User }, extensionCost: number, newEndTime: Date): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>续租确认</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px 0; }
          .extension-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .cost { color: #17a2b8; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>续租确认</h1>
            <p>您的续租请求已成功处理</p>
          </div>

          <div class="content">
            <p>尊敬的${booking.user.email}，</p>

            <p>您的续租请求已成功处理。以下是续租详情：</p>

            <div class="extension-details">
              <h3>续租详情</h3>
              <p><strong>预订编号：</strong> ${booking.id}</p>
              <p><strong>续租费用：</strong> <span class="cost">¥${extensionCost.toFixed(2)}</span></p>
              <p><strong>新的结束时间：</strong> ${newEndTime.toLocaleString('zh-CN')}</p>
            </div>

            <p>您可以继续使用滑板车至新的结束时间。如有任何问题，请联系我们的客服。</p>
          </div>

          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>© 2024 滑板车租赁系统</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}