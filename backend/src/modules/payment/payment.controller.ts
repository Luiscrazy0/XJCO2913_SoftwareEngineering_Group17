import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
/**
* Payment controller class.
*/
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body()
    body: CreatePaymentDto
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