import { IsString, IsNotEmpty } from 'class-validator';

export class CreateScooterDto {
  @IsString()
  @IsNotEmpty()
  location: string;
}