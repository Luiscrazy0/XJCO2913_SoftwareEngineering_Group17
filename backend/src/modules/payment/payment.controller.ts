/*
* @description: Payment controller for handling payment-related operations.
*/
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';


/**
* Payment controller class.
*/
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}


  /**
* Creates a new payment.
*
* @param body - Payment body with booking ID and amount.
*
* @returns The created payment.
*/
  @Post()
  create(
    @Body()
    body: {
      bookingId: string;
      amount: number;
    },
  ) {
    return this.paymentService.createPayment(body.bookingId, body.amount);
  }


  /**
* Gets a payment by booking ID.
*
* @param bookingId - Booking ID.
*
* @returns The payment.
*/
  @Get(':bookingId')
  getByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentService.getPaymentByBooking(bookingId);
  }
}