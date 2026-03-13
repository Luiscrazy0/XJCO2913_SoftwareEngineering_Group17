import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {

  @IsUUID()
  bookingId: string;

  @IsNumber()
  @Min(0) //金额必须大于等于0
  amount: number;

}