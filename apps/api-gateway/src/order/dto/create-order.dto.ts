import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  product!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}
