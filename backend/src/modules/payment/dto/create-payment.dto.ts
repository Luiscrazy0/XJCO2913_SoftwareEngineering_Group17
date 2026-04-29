import { IsUUID, IsNumber, Min, IsString, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  bookingId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
