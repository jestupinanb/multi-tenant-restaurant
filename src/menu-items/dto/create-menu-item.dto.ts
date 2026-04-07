import { IsString, IsNumber, IsOptional, MinLength, MaxLength, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
