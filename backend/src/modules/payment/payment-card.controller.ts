import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentCardService } from './payment-card.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment-cards')
@UseGuards(JwtAuthGuard)
export class PaymentCardController {
  constructor(private readonly paymentCardService: PaymentCardService) {}

  @Post()
  async addCard(@Request() req, @Body() cardData: any) {
    const userId = req.user.id;
    return this.paymentCardService.addCard(
      userId,
      cardData.cardNumber,
      cardData.expiryDate,
      cardData.cardHolder,
    );
  }

  @Get()
  async getUserCards(@Request() req) {
    const userId = req.user.id;
    return this.paymentCardService.getUserCards(userId);
  }

  @Get('default')
  async getDefaultCard(@Request() req) {
    const userId = req.user.id;
    return this.paymentCardService.getDefaultCard(userId);
  }

  @Put(':id/default')
  async setDefaultCard(@Request() req, @Param('id') cardId: string) {
    const userId = req.user.id;
    return this.paymentCardService.setDefaultCard(userId, cardId);
  }

  @Delete(':id')
  async deleteCard(@Request() req, @Param('id') cardId: string) {
    const userId = req.user.id;
    return this.paymentCardService.deleteCard(userId, cardId);
  }
}
