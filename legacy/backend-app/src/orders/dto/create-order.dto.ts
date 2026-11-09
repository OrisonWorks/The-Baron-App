import { IsArray, ArrayNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  items: any[];

  @IsNumber()
  @Min(0)
  total: number;
}
